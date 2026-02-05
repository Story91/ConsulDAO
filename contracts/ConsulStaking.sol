// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConsulStaking
 * @notice Stake $CONSUL to earn veConsul voting power
 * @dev Voting power = staked amount × lock duration multiplier
 *
 * Lock Periods & Multipliers:
 * - No lock (flexible): 1.0x
 * - 3 months: 1.25x
 * - 6 months: 1.5x
 * - 12 months: 2.0x
 */
contract ConsulStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Staking info per user
    struct StakeInfo {
        uint256 amount; // Amount staked
        uint256 lockEnd; // Timestamp when lock ends (0 = flexible)
        uint256 lockDuration; // Original lock duration in seconds
        uint256 stakedAt; // When stake was created
    }

    /// @notice The CONSUL token
    IERC20 public immutable consulToken;

    /// @notice User address => Stake info
    mapping(address => StakeInfo) public stakes;

    /// @notice Total staked across all users
    uint256 public totalStaked;

    /// @notice Lock duration => voting power multiplier (basis points, 10000 = 1x)
    mapping(uint256 => uint256) public lockMultipliers;

    /// @notice Predefined lock durations
    uint256 public constant LOCK_NONE = 0;
    uint256 public constant LOCK_3_MONTHS = 90 days;
    uint256 public constant LOCK_6_MONTHS = 180 days;
    uint256 public constant LOCK_12_MONTHS = 365 days;

    // Events
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 lockDuration,
        uint256 lockEnd
    );
    event Unstaked(address indexed user, uint256 amount);
    event LockExtended(
        address indexed user,
        uint256 newLockDuration,
        uint256 newLockEnd
    );

    // Errors
    error ZeroAmount();
    error NoStake();
    error StillLocked(uint256 lockEnd);
    error InvalidLockDuration(uint256 duration);
    error InsufficientBalance(uint256 requested, uint256 available);

    constructor(
        address _consulToken,
        address _initialOwner
    ) Ownable(_initialOwner) {
        consulToken = IERC20(_consulToken);

        // Set multipliers (basis points: 10000 = 1x)
        lockMultipliers[LOCK_NONE] = 10000; // 1.0x
        lockMultipliers[LOCK_3_MONTHS] = 12500; // 1.25x
        lockMultipliers[LOCK_6_MONTHS] = 15000; // 1.5x
        lockMultipliers[LOCK_12_MONTHS] = 20000; // 2.0x
    }

    /**
     * @notice Stake CONSUL tokens
     * @param amount Amount to stake
     * @param lockDuration Lock duration (0, 90 days, 180 days, or 365 days)
     */
    function stake(uint256 amount, uint256 lockDuration) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (lockMultipliers[lockDuration] == 0) {
            revert InvalidLockDuration(lockDuration);
        }

        // Transfer tokens to contract
        consulToken.safeTransferFrom(msg.sender, address(this), amount);

        StakeInfo storage info = stakes[msg.sender];

        // If user has existing stake, they can add to it
        // New lock must be >= existing lock remaining
        uint256 newLockEnd = lockDuration > 0
            ? block.timestamp + lockDuration
            : 0;

        if (info.amount > 0 && info.lockEnd > newLockEnd) {
            // Keep existing lock if it's longer
            newLockEnd = info.lockEnd;
        }

        info.amount += amount;
        info.lockEnd = newLockEnd;
        info.lockDuration = lockDuration;
        if (info.stakedAt == 0) {
            info.stakedAt = block.timestamp;
        }

        totalStaked += amount;

        emit Staked(msg.sender, amount, lockDuration, newLockEnd);
    }

    /**
     * @notice Unstake tokens (must be past lock period)
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];

        if (info.amount == 0) revert NoStake();
        if (amount > info.amount) {
            revert InsufficientBalance(amount, info.amount);
        }
        if (info.lockEnd > 0 && block.timestamp < info.lockEnd) {
            revert StillLocked(info.lockEnd);
        }

        info.amount -= amount;
        totalStaked -= amount;

        // Reset if fully unstaked
        if (info.amount == 0) {
            info.lockEnd = 0;
            info.lockDuration = 0;
            info.stakedAt = 0;
        }

        consulToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Get voting power for an address
     * @param user Address to check
     * @return Voting power (staked amount × multiplier)
     */
    function getVotingPower(address user) external view returns (uint256) {
        StakeInfo memory info = stakes[user];
        if (info.amount == 0) return 0;

        uint256 multiplier = lockMultipliers[info.lockDuration];
        if (multiplier == 0) multiplier = 10000; // Default 1x

        return (info.amount * multiplier) / 10000;
    }

    /**
     * @notice Get stake info for a user
     */
    function getStakeInfo(
        address user
    )
        external
        view
        returns (
            uint256 amount,
            uint256 lockEnd,
            uint256 lockDuration,
            uint256 votingPower,
            bool canUnstake
        )
    {
        StakeInfo memory info = stakes[user];
        uint256 multiplier = lockMultipliers[info.lockDuration];
        if (multiplier == 0) multiplier = 10000;

        return (
            info.amount,
            info.lockEnd,
            info.lockDuration,
            (info.amount * multiplier) / 10000,
            info.lockEnd == 0 || block.timestamp >= info.lockEnd
        );
    }

    /**
     * @notice Extend lock duration (cannot shorten)
     * @param newLockDuration New lock duration
     */
    function extendLock(uint256 newLockDuration) external {
        if (lockMultipliers[newLockDuration] == 0) {
            revert InvalidLockDuration(newLockDuration);
        }

        StakeInfo storage info = stakes[msg.sender];
        if (info.amount == 0) revert NoStake();

        uint256 newLockEnd = block.timestamp + newLockDuration;
        require(newLockEnd > info.lockEnd, "Cannot shorten lock");

        info.lockEnd = newLockEnd;
        info.lockDuration = newLockDuration;

        emit LockExtended(msg.sender, newLockDuration, newLockEnd);
    }
}
