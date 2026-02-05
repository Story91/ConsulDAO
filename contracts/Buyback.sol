// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Interface for ERC20Burnable tokens
interface IERC20Burnable {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/// @notice Uniswap V3 SwapRouter interface (exactInputSingle)
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

/**
 * @title Buyback
 * @notice Treasury buyback & burn mechanism for $CONSUL
 * @dev Uses USDC from treasury to buy CONSUL and burn it
 *
 * Governance Flow:
 * 1. Token holders vote on buyback proposal via HubDAO
 * 2. HubDAO calls executeBuyback() with approved USDC amount
 * 3. Contract swaps USDC → CONSUL via DEX
 * 4. Bought CONSUL is burned (reducing supply)
 */
contract Buyback is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice USDC token (payment token)
    IERC20 public immutable usdc;

    /// @notice CONSUL token (to be bought and burned)
    IERC20 public immutable consulToken;

    /// @notice HubDAO address (only caller for buybacks)
    address public hubDao;

    /// @notice Total USDC spent on buybacks
    uint256 public totalBuybackSpent;

    /// @notice Total CONSUL burned
    uint256 public totalBurned;

    /// @notice DEX Router for swaps (e.g., Uniswap)
    address public dexRouter;

    // Events
    event BuybackExecuted(
        uint256 usdcSpent,
        uint256 consulBought,
        uint256 consulBurned,
        uint256 timestamp
    );
    event HubDaoUpdated(address indexed oldHubDao, address indexed newHubDao);
    event DexRouterUpdated(
        address indexed oldRouter,
        address indexed newRouter
    );

    // Errors
    error OnlyHubDao();
    error ZeroAmount();
    error InsufficientBalance(uint256 requested, uint256 available);
    error DexRouterNotSet();
    error SwapFailed();

    modifier onlyHubDao() {
        if (msg.sender != hubDao) revert OnlyHubDao();
        _;
    }

    constructor(
        address _usdc,
        address _consulToken,
        address _hubDao,
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_consulToken != address(0), "Invalid CONSUL address");
        require(_hubDao != address(0), "Invalid HubDAO address");
        usdc = IERC20(_usdc);
        consulToken = IERC20(_consulToken);
        hubDao = _hubDao;
    }

    /**
     * @notice Execute a buyback using USDC from treasury
     * @dev Only callable by HubDAO after governance approval
     * @param usdcAmount Amount of USDC to spend on buyback
     * @param minConsulOut Minimum CONSUL to receive (slippage protection)
     */
    function executeBuyback(
        uint256 usdcAmount,
        uint256 minConsulOut
    ) external onlyHubDao nonReentrant {
        if (usdcAmount == 0) revert ZeroAmount();

        uint256 usdcBalance = usdc.balanceOf(address(this));
        if (usdcBalance < usdcAmount) {
            revert InsufficientBalance(usdcAmount, usdcBalance);
        }

        if (dexRouter == address(0)) revert DexRouterNotSet();

        uint256 consulBought = _executeSwap(usdcAmount, minConsulOut);

        // Burn the bought CONSUL
        _burnConsul(consulBought);

        totalBuybackSpent += usdcAmount;
        totalBurned += consulBought;

        emit BuybackExecuted(
            usdcAmount,
            consulBought,
            consulBought,
            block.timestamp
        );
    }

    /// @notice Pool fee tier for USDC/CONSUL pair (default 0.3%)
    uint24 public poolFee = 3000;

    /**
     * @notice Update the pool fee tier
     */
    function setPoolFee(uint24 _poolFee) external onlyOwner {
        require(
            _poolFee == 100 || _poolFee == 500 || _poolFee == 3000 || _poolFee == 10000,
            "Invalid fee tier"
        );
        poolFee = _poolFee;
    }

    /**
     * @notice Execute swap on DEX via Uniswap V3 router
     */
    function _executeSwap(
        uint256 usdcAmount,
        uint256 minConsulOut
    ) internal returns (uint256 consulOut) {
        if (dexRouter == address(0)) revert DexRouterNotSet();

        // Approve router to spend USDC (reset first for tokens that require it)
        usdc.forceApprove(dexRouter, usdcAmount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(usdc),
            tokenOut: address(consulToken),
            fee: poolFee,
            recipient: address(this),
            amountIn: usdcAmount,
            amountOutMinimum: minConsulOut,
            sqrtPriceLimitX96: 0
        });

        consulOut = ISwapRouter(dexRouter).exactInputSingle(params);
        if (consulOut == 0) revert SwapFailed();
    }

    /**
     * @notice Burn CONSUL tokens using ERC20Burnable.burn()
     * @dev Actually reduces totalSupply(), unlike dead-address transfers
     */
    function _burnConsul(uint256 amount) internal {
        IERC20Burnable(address(consulToken)).burn(amount);
    }

    /**
     * @notice Deposit USDC to contract for buybacks
     * @param amount Amount to deposit
     */
    function depositUsdc(uint256 amount) external {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Update HubDAO address
     */
    function setHubDao(address _hubDao) external onlyOwner {
        require(_hubDao != address(0), "Invalid address");
        address old = hubDao;
        hubDao = _hubDao;
        emit HubDaoUpdated(old, _hubDao);
    }

    /**
     * @notice Update DEX Router
     */
    function setDexRouter(address _dexRouter) external onlyOwner {
        address old = dexRouter;
        dexRouter = _dexRouter;
        emit DexRouterUpdated(old, _dexRouter);
    }

    /**
     * @notice Get buyback stats
     */
    function getBuybackStats()
        external
        view
        returns (uint256 usdcSpent, uint256 consulBurned, uint256 usdcBalance)
    {
        return (totalBuybackSpent, totalBurned, usdc.balanceOf(address(this)));
    }

    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
