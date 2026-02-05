// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Fundraiser
 * @notice Handles public fundraising for the ConsulDAO encapsulated project
 */
contract Fundraiser is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The treasury address where funds eventually go (HubDAO)
    address public treasury;

    // Supported Contribution Tokens (e.g., USDC)
    IERC20 public contributionToken;

    // Track contributions
    mapping(address => uint256) public contributions;
    uint256 public totalRaised;

    // Fundraising status and goal
    bool public isLive;
    uint256 public goal;
    uint256 public deadline;
    bool public finalized;

    event ContributionReceived(address indexed contributor, uint256 amount);
    event FundsForwarded(address indexed treasury, uint256 amount);
    event FundraisingStateChanged(bool isOpen);
    event Refunded(address indexed contributor, uint256 amount);

    constructor(
        address _initialOwner,
        address _treasury,
        address _contributionToken,
        uint256 _goal,
        uint256 _durationSeconds
    ) Ownable(_initialOwner) {
        require(_treasury != address(0), "Invalid treasury");
        require(_contributionToken != address(0), "Invalid token");
        require(_goal > 0, "Goal must be > 0");
        treasury = _treasury;
        contributionToken = IERC20(_contributionToken);
        goal = _goal;
        deadline = block.timestamp + _durationSeconds;
    }

    /**
     * @notice Toggle fundraising state
     */
    function setFundraisingState(bool _isOpen) external onlyOwner {
        require(!finalized, "Already finalized");
        isLive = _isOpen;
        emit FundraisingStateChanged(_isOpen);
    }

    /**
     * @notice Contribute funds (ERC20)
     * @param amount Amount to contribute
     */
    function contribute(uint256 amount) external nonReentrant {
        require(isLive, "Fundraising not active");
        require(!finalized, "Already finalized");
        require(block.timestamp <= deadline, "Deadline passed");
        require(amount > 0, "Amount must be > 0");

        // Transfer tokens from user to this contract
        contributionToken.safeTransferFrom(msg.sender, address(this), amount);

        contributions[msg.sender] += amount;
        totalRaised += amount;

        emit ContributionReceived(msg.sender, amount);
    }

    /**
     * @notice Forward all held funds to the treasury (only if goal met)
     */
    function forwardToTreasury() external onlyOwner {
        require(totalRaised >= goal, "Goal not reached");
        require(!finalized, "Already finalized");

        finalized = true;
        uint256 balance = contributionToken.balanceOf(address(this));
        require(balance > 0, "No funds to forward");

        contributionToken.safeTransfer(treasury, balance);

        emit FundsForwarded(treasury, balance);
    }

    /**
     * @notice Claim a refund if fundraising failed (goal not met after deadline)
     */
    function refund() external nonReentrant {
        require(block.timestamp > deadline, "Deadline not reached");
        require(totalRaised < goal, "Goal was reached");
        require(!finalized, "Already finalized");

        uint256 amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        contributionToken.safeTransfer(msg.sender, amount);

        emit Refunded(msg.sender, amount);
    }

    /**
     * @notice Update treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasury = newTreasury;
    }
}
