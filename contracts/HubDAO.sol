// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HubDAO
 * @notice Main DAO contract that holds the treasury, approves quarterly budgets, and has veto power
 * @dev Integrates with ConsulStaking for vote-weighted governance and Buyback for treasury management
 */
interface ISquads {
    function fundSquadBudget(uint256 squadId, uint256 amount) external;
}

interface IConsulStaking {
    function getVotingPower(address user) external view returns (uint256);
    function totalStaked() external view returns (uint256);
}

interface IBuyback {
    function executeBuyback(uint256 usdcAmount, uint256 minConsulOut) external;
}

contract HubDAO is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Treasury token (e.g., USDC)
    IERC20 public treasuryToken;
    address public squadsContract;

    // Governance contracts
    IConsulStaking public stakingContract;
    IBuyback public buybackContract;

    // Quarterly budget structure
    struct QuarterlyBudget {
        uint256 amount;
        uint256 spent;
        uint256 startTime;
        uint256 endTime;
        bool approved;
        mapping(address => bool) votes;
        uint256 totalVotePower; // Sum of voting power from supporters
        uint256 snapshotTotalStaked; // Snapshot of total staked at proposal time
    }

    // Current quarter budget
    mapping(uint256 => QuarterlyBudget) public quarterlyBudgets;
    uint256 public currentQuarter;

    // Minimum voting threshold (in basis points, e.g., 5000 = 50%)
    uint256 public constant MIN_VOTING_THRESHOLD = 5000;

    // Veto power addresses
    mapping(address => bool) public vetoPowerHolders;

    // Events
    event BudgetProposed(uint256 indexed quarter, uint256 amount);
    event BudgetVoted(
        uint256 indexed quarter,
        address indexed voter,
        bool support
    );
    event BudgetApproved(uint256 indexed quarter, uint256 amount);
    event BudgetExecuted(
        uint256 indexed quarter,
        address indexed recipient,
        uint256 amount
    );
    event VetoExecuted(uint256 indexed quarter, address indexed vetoer);

    constructor(
        address _treasuryToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_treasuryToken != address(0), "Invalid treasury token");
        treasuryToken = IERC20(_treasuryToken);
        currentQuarter = 0;
    }

    /**
     * @notice Propose a quarterly budget
     * @param amount Budget amount in treasury token
     */
    function proposeBudget(uint256 amount) external onlyOwner {
        require(address(stakingContract) != address(0), "Staking not configured");

        currentQuarter++;
        QuarterlyBudget storage budget = quarterlyBudgets[currentQuarter];
        budget.amount = amount;
        budget.startTime = block.timestamp;
        budget.endTime = block.timestamp + 90 days; // 3 months
        budget.approved = false;
        budget.snapshotTotalStaked = stakingContract.totalStaked();

        emit BudgetProposed(currentQuarter, amount);
    }

    /**
     * @notice Vote on a quarterly budget
     * @param quarter Quarter number
     * @param support Whether to support the budget
     */
    function voteOnBudget(uint256 quarter, bool support) external {
        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(block.timestamp <= budget.endTime, "Voting period ended");
        require(!budget.votes[msg.sender], "Already voted");

        // Require staking contract to be set for weighted voting
        require(address(stakingContract) != address(0), "Staking not configured");

        uint256 voterPower = stakingContract.getVotingPower(msg.sender);
        require(voterPower > 0, "No voting power");

        budget.votes[msg.sender] = true;
        if (support) {
            budget.totalVotePower += voterPower;
        }

        emit BudgetVoted(quarter, msg.sender, support);
    }

    /**
     * @notice Approve budget if voting threshold is met
     * @param quarter Quarter number
     */
    function approveBudget(uint256 quarter) external {
        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(!budget.approved, "Already approved");
        require(block.timestamp <= budget.endTime, "Voting period ended");

        // Check voting threshold against snapshot taken at proposal time
        require(budget.snapshotTotalStaked > 0, "No tokens staked at proposal");
        require(
            budget.totalVotePower * 10000 / budget.snapshotTotalStaked >= MIN_VOTING_THRESHOLD,
            "Insufficient vote power"
        );

        budget.approved = true;

        emit BudgetApproved(quarter, budget.amount);
    }

    /**
     * @notice Execute budget payment to recipient
     * @param quarter Quarter number
     * @param recipient Address to receive funds
     * @param amount Amount to transfer
     */
    function executeBudget(
        uint256 quarter,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(budget.approved, "Budget not approved");
        require(
            block.timestamp >= budget.startTime,
            "Budget period not started"
        );
        require(block.timestamp <= budget.endTime, "Budget period ended");

        uint256 remaining = budget.amount - budget.spent;
        require(amount <= remaining, "Amount exceeds remaining budget");

        budget.spent += amount;
        treasuryToken.safeTransfer(recipient, amount);

        emit BudgetExecuted(quarter, recipient, amount);
    }

    /**
     * @notice Veto a budget (only veto power holders)
     * @param quarter Quarter number
     */
    function vetoBudget(uint256 quarter) external {
        require(vetoPowerHolders[msg.sender], "Not authorized to veto");
        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(budget.approved, "Budget not approved");

        budget.approved = false;

        emit VetoExecuted(quarter, msg.sender);
    }

    /**
     * @notice Add or remove veto power holder
     * @param holder Address to grant/revoke veto power
     * @param hasPower Whether to grant veto power
     */
    function setVetoPower(address holder, bool hasPower) external onlyOwner {
        vetoPowerHolders[holder] = hasPower;
    }

    function setSquadsContract(address _squadsContract) external onlyOwner {
        squadsContract = _squadsContract;
    }

    /**
     * @notice Allocate funds to a specific squad from an approved budget
     * @param quarter The approved budget quarter to draw from
     * @param squadId ID of the squad to fund
     * @param amount Amount to allocate
     */
    function allocateSquadBudget(
        uint256 quarter,
        uint256 squadId,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(squadsContract != address(0), "Squads contract not set");

        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(budget.approved, "Budget not approved");
        require(block.timestamp <= budget.endTime, "Budget period ended");
        uint256 remaining = budget.amount - budget.spent;
        require(amount <= remaining, "Amount exceeds remaining budget");

        budget.spent += amount;

        // Transfer tokens to Squads contract
        treasuryToken.safeTransfer(squadsContract, amount);

        // Update budget in Squads contract
        ISquads(squadsContract).fundSquadBudget(squadId, amount);
    }

    /**
     * @notice Get treasury balance
     * @return Balance of treasury token
     */
    function getTreasuryBalance() external view returns (uint256) {
        return treasuryToken.balanceOf(address(this));
    }

    // ============ Governance Integration ============

    /**
     * @notice Set the staking contract for vote-weighted governance
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid address");
        stakingContract = IConsulStaking(_stakingContract);
    }

    /**
     * @notice Set the buyback contract
     */
    function setBuybackContract(address _buybackContract) external onlyOwner {
        require(_buybackContract != address(0), "Invalid address");
        buybackContract = IBuyback(_buybackContract);
    }

    /**
     * @notice Get voting power for an address (from staking)
     * @param voter Address to check
     * @return Voting power (0 if no staking contract set)
     */
    function getVotingPower(address voter) external view returns (uint256) {
        if (address(stakingContract) == address(0)) return 0;
        return stakingContract.getVotingPower(voter);
    }

    /**
     * @notice Execute a buyback using treasury USDC from an approved budget
     * @param quarter The approved budget quarter to draw from
     * @param usdcAmount Amount of USDC to spend
     * @param minConsulOut Minimum CONSUL to receive (slippage)
     */
    function triggerBuyback(
        uint256 quarter,
        uint256 usdcAmount,
        uint256 minConsulOut
    ) external onlyOwner nonReentrant {
        require(address(buybackContract) != address(0), "Buyback not set");

        QuarterlyBudget storage budget = quarterlyBudgets[quarter];
        require(budget.approved, "Budget not approved");
        require(block.timestamp <= budget.endTime, "Budget period ended");
        uint256 remaining = budget.amount - budget.spent;
        require(usdcAmount <= remaining, "Amount exceeds remaining budget");

        budget.spent += usdcAmount;

        // Transfer USDC to buyback contract
        treasuryToken.safeTransfer(address(buybackContract), usdcAmount);

        // Execute the buyback
        buybackContract.executeBuyback(usdcAmount, minConsulOut);
    }
}
