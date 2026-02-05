// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title ConsulToken
 * @notice $CONSUL - Governance token for ConsulDAO
 * @dev ERC20 with voting delegation (ERC20Votes) and burnable for buyback mechanism
 *
 * Tokenomics:
 * - Max Supply: 100,000,000 CONSUL (100M)
 * - Initial mint to deployer for distribution
 * - Burnable for buyback & burn mechanism
 * - Vote delegation for governance
 */
contract ConsulToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable {
    /// @notice Maximum supply cap: 100 million tokens
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    /// @notice Tracks if initial mint has occurred
    bool public initialMintDone;

    // Events
    event InitialMintCompleted(address indexed recipient, uint256 amount);

    // Errors
    error MaxSupplyExceeded(uint256 requested, uint256 available);
    error InitialMintAlreadyDone();

    constructor(
        address _initialOwner
    )
        ERC20("ConsulDAO", "CONSUL")
        ERC20Permit("ConsulDAO")
        Ownable(_initialOwner)
    {}

    /**
     * @notice Perform initial token distribution
     * @param recipient Address to receive initial supply
     * @param amount Amount to mint (max: MAX_SUPPLY)
     */
    function initialMint(address recipient, uint256 amount) external onlyOwner {
        if (initialMintDone) {
            revert InitialMintAlreadyDone();
        }
        if (amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded(amount, MAX_SUPPLY);
        }

        initialMintDone = true;
        _mint(recipient, amount);

        emit InitialMintCompleted(recipient, amount);
    }

    /**
     * @notice Mint additional tokens (only owner, respects max supply)
     * @dev Used for future emissions, rewards, etc.
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded(amount, MAX_SUPPLY - totalSupply());
        }
        _mint(to, amount);
    }

    // Required overrides for ERC20Votes + ERC20Permit

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
