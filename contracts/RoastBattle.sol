// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoastBattle
 * @dev On-chain roast battles. Stake $ROAST, submit roasts, AI judges winner.
 */
contract RoastBattle is Ownable, ReentrancyGuard {
    IERC20 public roastToken;
    
    uint256 public battleCount;
    uint256 public minStake = 100 * 10**18; // 100 ROAST minimum
    uint256 public platformFee = 5; // 5% platform fee
    
    struct Battle {
        uint256 id;
        address challenger;
        address defender;
        uint256 pot;
        string challengerRoast;
        string defenderRoast;
        address winner;
        bool resolved;
        uint256 createdAt;
    }
    
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256) public userBattles;
    
    event BattleCreated(uint256 indexed battleId, address indexed challenger, address indexed target, uint256 stake);
    event RoastSubmitted(uint256 indexed battleId, address indexed participant, string roast);
    event BattleResolved(uint256 indexed battleId, address indexed winner, uint256 payout);
    
    constructor(address _roastToken) Ownable(msg.sender) {
        roastToken = IERC20(_roastToken);
    }
    
    /**
     * @dev Create a new roast battle
     * @param target Address to roast
     * @param roast Your roast text
     * @param stake Amount of ROAST tokens to stake
     */
    function createBattle(address target, string memory roast, uint256 stake) external nonReentrant {
        require(stake >= minStake, "Stake too low");
        require(target != msg.sender, "Cannot roast yourself");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast length");
        
        // Transfer stake from challenger
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battleCount++;
        
        battles[battleCount] = Battle({
            id: battleCount,
            challenger: msg.sender,
            defender: target,
            pot: stake,
            challengerRoast: roast,
            defenderRoast: "",
            winner: address(0),
            resolved: false,
            createdAt: block.timestamp
        });
        
        emit BattleCreated(battleCount, msg.sender, target, stake);
        emit RoastSubmitted(battleCount, msg.sender, roast);
    }
    
    /**
     * @dev Defender responds to a roast battle
     * @param battleId ID of the battle
     * @param roast Your counter-roast
     * @param stake Amount to match (must match or exceed challenger's stake)
     */
    function respondToBattle(uint256 battleId, string memory roast, uint256 stake) external nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(msg.sender == battle.defender, "Not the defender");
        require(!battle.resolved, "Battle already resolved");
        require(bytes(battle.defenderRoast).length == 0, "Already responded");
        require(stake >= battle.pot, "Must match or exceed stake");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast length");
        
        // Transfer stake from defender
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battle.pot += stake;
        battle.defenderRoast = roast;
        
        emit RoastSubmitted(battleId, msg.sender, roast);
    }
    
    /**
     * @dev Resolve battle (AI judge calls this off-chain)
     * @param battleId ID of the battle
     * @param winnerId 1 for challenger, 2 for defender
     */
    function resolveBattle(uint256 battleId, uint8 winnerId) external onlyOwner nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Already resolved");
        require(bytes(battle.defenderRoast).length > 0, "Defender hasn't responded");
        require(winnerId == 1 || winnerId == 2, "Invalid winner");
        
        address winner = winnerId == 1 ? battle.challenger : battle.defender;
        
        // Calculate payouts
        uint256 fee = (battle.pot * platformFee) / 100;
        uint256 payout = battle.pot - fee;
        
        battle.winner = winner;
        battle.resolved = true;
        
        // Transfer winnings
        require(roastToken.transfer(winner, payout), "Payout failed");
        
        // Fee stays in contract (can be withdrawn by owner)
        
        emit BattleResolved(battleId, winner, payout);
    }
    
    /**
     * @dev Auto-resolve if defender doesn't respond within 24 hours
     * @param battleId ID of the battle
     */
    function forfeit(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Already resolved");
        require(bytes(battle.defenderRoast).length == 0, "Defender responded");
        require(block.timestamp >= battle.createdAt + 24 hours, "Too early to forfeit");
        
        // Challenger wins by forfeit
        battle.winner = battle.challenger;
        battle.resolved = true;
        
        uint256 fee = (battle.pot * platformFee) / 100;
        uint256 payout = battle.pot - fee;
        
        require(roastToken.transfer(battle.challenger, payout), "Payout failed");
        
        emit BattleResolved(battleId, battle.challenger, payout);
    }
    
    /**
     * @dev Get battle details
     */
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }
    
    /**
     * @dev Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = roastToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(roastToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Update minimum stake
     */
    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }
    
    /**
     * @dev Update platform fee (max 10%)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10, "Fee too high");
        platformFee = _fee;
    }
}
