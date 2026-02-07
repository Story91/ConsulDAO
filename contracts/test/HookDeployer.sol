// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HookDeployer
 * @notice CREATE2 factory for deploying Uniswap v4 hooks with specific address bits
 * @dev Mines a salt so the resulting address encodes the required hook permissions
 */
contract HookDeployer {
    event Deployed(address indexed addr, bytes32 salt);

    /**
     * @notice Deploy a contract using CREATE2
     * @param salt The salt for CREATE2 (mined off-chain)
     * @param creationCode The contract creation code (abi.encodePacked(type(X).creationCode, abi.encode(args)))
     * @return addr The deployed contract address
     */
    function deploy(bytes32 salt, bytes memory creationCode) external returns (address addr) {
        assembly {
            addr := create2(0, add(creationCode, 0x20), mload(creationCode), salt)
        }
        require(addr != address(0), "CREATE2 failed");
        emit Deployed(addr, salt);
    }

    /**
     * @notice Compute the CREATE2 address for given salt and creationCode
     * @param salt The salt
     * @param creationCode The contract creation code
     * @return The predicted address
     */
    function computeAddress(bytes32 salt, bytes memory creationCode) external view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            keccak256(creationCode)
                        )
                    )
                )
            )
        );
    }
}

