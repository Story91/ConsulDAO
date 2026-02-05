// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockSwapRouter
 * @notice Mock Uniswap V3 SwapRouter for testing Buyback contract
 */
contract MockSwapRouter {
    // 1:1 swap rate for simplicity
    uint256 public swapRate = 1;

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function setSwapRate(uint256 _rate) external {
        swapRate = _rate;
    }

    function exactInputSingle(
        ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut) {
        // Take tokenIn from sender
        IERC20(params.tokenIn).transferFrom(
            msg.sender,
            address(this),
            params.amountIn
        );

        // Calculate output
        amountOut = params.amountIn * swapRate;
        require(amountOut >= params.amountOutMinimum, "Insufficient output");

        // Send tokenOut to recipient
        IERC20(params.tokenOut).transfer(params.recipient, amountOut);
    }
}
