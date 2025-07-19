// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPYUSD
 * @dev Mock PayPal USD token for BSC testnet testing
 * @author YOREE Team
 */
contract MockPYUSD is ERC20, Ownable {
    
    constructor() ERC20("PayPal USD", "PYUSD") {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M PYUSD
    }
    
    /**
     * @dev Mint tokens (only owner for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Get testnet faucet tokens
     */
    function getTestTokens() external {
        require(balanceOf(msg.sender) == 0, "Already claimed test tokens");
        _mint(msg.sender, 1000 * 10**decimals()); // 1000 PYUSD
    }
    
    /**
     * @dev Decimals override (PYUSD uses 6 decimals)
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
} 