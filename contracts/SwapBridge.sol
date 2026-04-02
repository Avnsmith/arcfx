// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SwapBridge
 * @dev Simple swap/bridge contract for local testing
 * Allows swapping USDC tokens on local chain
 */
contract SwapBridge is Ownable {
    using SafeERC20 for IERC20;

    // Bridge fee in basis points (100 = 1%)
    uint256 public bridgeFeeBps = 10; // 0.1%

    // Minimum swap amount
    uint256 public minSwapAmount = 1 * 10**6; // 1 USDC (6 decimals)

    // Events
    event SwapInitiated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 fee,
        uint256 indexed destinationChainId
    );

    event FeeUpdated(uint256 newFee);
    event MinSwapAmountUpdated(uint256 newAmount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Initiate a swap/bridge transaction
     * @param token Address of the token to swap
     * @param amount Amount to swap (in token decimals)
     * @param destinationChainId Chain ID of destination (for future multichain)
     */
    function swap(
        address token,
        uint256 amount,
        uint256 destinationChainId
    ) external {
        require(amount >= minSwapAmount, "Amount below minimum");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(msg.sender);
        require(balance >= amount, "Insufficient balance");

        // Calculate fee
        uint256 fee = (amount * bridgeFeeBps) / 10000;
        uint256 amountAfterFee = amount - fee;

        // Transfer tokens from user
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);

        // In a real bridge, tokens would be locked and minted on destination
        // For local testing, we just transfer to contract
        // In production, you'd integrate with Circle CCTP or similar

        emit SwapInitiated(msg.sender, token, amount, fee, destinationChainId);
    }

    /**
     * @dev Set bridge fee (only owner)
     * @param newFee New fee in basis points
     */
    function setBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        bridgeFeeBps = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Set minimum swap amount (only owner)
     * @param newAmount New minimum amount
     */
    function setMinSwapAmount(uint256 newAmount) external onlyOwner {
        minSwapAmount = newAmount;
        emit MinSwapAmountUpdated(newAmount);
    }

    /**
     * @dev Withdraw tokens from contract (only owner)
     */
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

