// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StrategyManager
 * @dev Manages AI-powered trading strategies on BNB Chain with PayPal USD integration
 * @author YOREE Team
 */
contract StrategyManager is Ownable, ReentrancyGuard, Pausable {
    
    // PayPal USD token address on BNB Chain
    IERC20 public paypalUSD;
    
    // Strategy structure
    struct Strategy {
        uint256 id;
        address creator;
        string name;
        string description;
        address targetToken;
        uint256 entryPrice;
        uint256 stopLoss;
        uint256 takeProfit;
        uint256 positionSize;
        bool isActive;
        uint256 createdAt;
        uint256 totalReturn;
        uint256 totalTrades;
        uint256 winRate;
    }
    
    // User positions
    struct Position {
        uint256 strategyId;
        uint256 amount;
        uint256 entryPrice;
        uint256 timestamp;
        bool isOpen;
    }
    
    // State variables
    uint256 public strategyCount;
    uint256 public totalVolume;
    uint256 public platformFee = 25; // 0.25% in basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Mappings
    mapping(uint256 => Strategy) public strategies;
    mapping(address => Position[]) public userPositions;
    mapping(address => uint256) public userTotalVolume;
    mapping(address => uint256) public userTotalProfit;
    
    // Events
    event StrategyCreated(uint256 indexed strategyId, address indexed creator, string name);
    event PositionOpened(uint256 indexed strategyId, address indexed user, uint256 amount, uint256 entryPrice);
    event PositionClosed(uint256 indexed strategyId, address indexed user, uint256 profit, uint256 exitPrice);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newStopLoss, uint256 newTakeProfit);
    event PlatformFeeUpdated(uint256 newFee);
    
    constructor(address _paypalUSD) {
        paypalUSD = IERC20(_paypalUSD);
    }
    
    /**
     * @dev Create a new trading strategy
     */
    function createStrategy(
        string memory _name,
        string memory _description,
        address _targetToken,
        uint256 _stopLoss,
        uint256 _takeProfit,
        uint256 _positionSize
    ) external whenNotPaused returns (uint256) {
        require(bytes(_name).length > 0, "Strategy name cannot be empty");
        require(_targetToken != address(0), "Invalid target token");
        require(_stopLoss > 0 && _takeProfit > 0, "Invalid stop loss or take profit");
        require(_positionSize > 0, "Position size must be greater than 0");
        
        strategyCount++;
        
        Strategy memory newStrategy = Strategy({
            id: strategyCount,
            creator: msg.sender,
            name: _name,
            description: _description,
            targetToken: _targetToken,
            entryPrice: 0, // Will be set when first position is opened
            stopLoss: _stopLoss,
            takeProfit: _takeProfit,
            positionSize: _positionSize,
            isActive: true,
            createdAt: block.timestamp,
            totalReturn: 0,
            totalTrades: 0,
            winRate: 0
        });
        
        strategies[strategyCount] = newStrategy;
        
        emit StrategyCreated(strategyCount, msg.sender, _name);
        return strategyCount;
    }
    
    /**
     * @dev Open a position in a strategy using PayPal USD
     */
    function openPosition(uint256 _strategyId, uint256 _amount) external nonReentrant whenNotPaused {
        Strategy storage strategy = strategies[_strategyId];
        require(strategy.isActive, "Strategy is not active");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer PayPal USD from user to contract
        require(paypalUSD.transferFrom(msg.sender, address(this), _amount), "PYUSD transfer failed");
        
        // Calculate platform fee
        uint256 fee = (_amount * platformFee) / BASIS_POINTS;
        uint256 netAmount = _amount - fee;
        
        // Create position
        Position memory newPosition = Position({
            strategyId: _strategyId,
            amount: netAmount,
            entryPrice: getCurrentPrice(strategy.targetToken),
            timestamp: block.timestamp,
            isOpen: true
        });
        
        userPositions[msg.sender].push(newPosition);
        
        // Update strategy stats
        if (strategy.entryPrice == 0) {
            strategy.entryPrice = newPosition.entryPrice;
        }
        strategy.totalTrades++;
        
        // Update user stats
        userTotalVolume[msg.sender] += _amount;
        totalVolume += _amount;
        
        emit PositionOpened(_strategyId, msg.sender, netAmount, newPosition.entryPrice);
    }
    
    /**
     * @dev Close a position and calculate profit/loss
     */
    function closePosition(uint256 _positionIndex) external nonReentrant whenNotPaused {
        require(_positionIndex < userPositions[msg.sender].length, "Invalid position index");
        
        Position storage position = userPositions[msg.sender][_positionIndex];
        require(position.isOpen, "Position is already closed");
        
        Strategy storage strategy = strategies[position.strategyId];
        uint256 currentPrice = getCurrentPrice(strategy.targetToken);
        
        // Calculate profit/loss
        uint256 profit = 0;
        if (currentPrice > position.entryPrice) {
            profit = (position.amount * (currentPrice - position.entryPrice)) / position.entryPrice;
        }
        
        // Close position
        position.isOpen = false;
        
        // Transfer funds back to user
        uint256 totalReturn = position.amount + profit;
        require(paypalUSD.transfer(msg.sender, totalReturn), "PYUSD transfer failed");
        
        // Update strategy stats
        strategy.totalReturn += profit;
        if (profit > 0) {
            strategy.winRate = ((strategy.winRate * (strategy.totalTrades - 1)) + 100) / strategy.totalTrades;
        } else {
            strategy.winRate = (strategy.winRate * (strategy.totalTrades - 1)) / strategy.totalTrades;
        }
        
        // Update user stats
        userTotalProfit[msg.sender] += profit;
        
        emit PositionClosed(position.strategyId, msg.sender, profit, currentPrice);
    }
    
    /**
     * @dev Update strategy parameters (only creator can update)
     */
    function updateStrategy(
        uint256 _strategyId,
        uint256 _newStopLoss,
        uint256 _newTakeProfit
    ) external {
        Strategy storage strategy = strategies[_strategyId];
        require(strategy.creator == msg.sender, "Only creator can update strategy");
        require(_newStopLoss > 0 && _newTakeProfit > 0, "Invalid parameters");
        
        strategy.stopLoss = _newStopLoss;
        strategy.takeProfit = _newTakeProfit;
        
        emit StrategyUpdated(_strategyId, _newStopLoss, _newTakeProfit);
    }
    
    /**
     * @dev Get current price of a token (mock implementation - replace with real oracle)
     */
    function getCurrentPrice(address _token) public view returns (uint256) {
        // This is a mock implementation
        // In production, you would integrate with Chainlink or other price oracles
        if (_token == address(0)) { // BNB
            return 320 * 10**18; // $320 per BNB
        }
        return 1 * 10**18; // $1 for other tokens
    }
    
    /**
     * @dev Get user positions
     */
    function getUserPositions(address _user) external view returns (Position[] memory) {
        return userPositions[_user];
    }
    
    /**
     * @dev Get strategy details
     */
    function getStrategy(uint256 _strategyId) external view returns (Strategy memory) {
        return strategies[_strategyId];
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address _user) external view returns (uint256 totalVolume, uint256 totalProfit) {
        return (userTotalVolume[_user], userTotalProfit[_user]);
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }
    
    /**
     * @dev Pause/unpause contract (only owner)
     */
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
    
    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = paypalUSD.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(paypalUSD.transfer(owner(), balance), "Fee withdrawal failed");
    }
} 