// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HubDAO
 * @notice Main DAO contract that holds the treasury, approves quarterly budgets, and has veto power
 */
interface ISquads {
    function fundSquadBudget(uint256 squadId, uint256 amount) external;
}

contract HubDAO is Ownable, ReentrancyGuard {
    // Treasury token (e.g., USDC)
    IERC20 public treasuryToken;
    address public squadsContract;

    // Quarterly budget structure
    struct QuarterlyBudget {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool approved;
        mapping(address => bool) votes;
        uint256 voteCount;
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
        treasuryToken = IERC20(_treasuryToken);
        currentQuarter = 0;
    }

    /**
     * @notice Propose a quarterly budget
     * @param amount Budget amount in treasury token
     */
    function proposeBudget(uint256 amount) external onlyOwner {
        currentQuarter++;
        QuarterlyBudget storage budget = quarterlyBudgets[currentQuarter];
        budget.amount = amount;
        budget.startTime = block.timestamp;
        budget.endTime = block.timestamp + 90 days; // 3 months
        budget.approved = false;

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

        budget.votes[msg.sender] = true;
        if (support) {
            budget.voteCount++;
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

        // Check if voting threshold is met (simplified - should check token balance)
        require(
            budget.voteCount >= MIN_VOTING_THRESHOLD / 100,
            "Insufficient votes"
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
        require(amount <= budget.amount, "Amount exceeds budget");

        require(treasuryToken.transfer(recipient, amount), "Transfer failed");

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
     * @notice Allocate funds to a specific squad
     * @dev Transfers tokens to Squads contract and updates budget mapping there
     */
    function allocateSquadBudget(
        uint256 squadId,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(squadsContract != address(0), "Squads contract not set");

        // Transfer tokens to Squads contract
        require(
            treasuryToken.transfer(squadsContract, amount),
            "Transfer failed"
        );

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
}
