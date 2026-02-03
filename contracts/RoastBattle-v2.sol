// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RoastBattle v2
 * @dev Twitter-first roast battles with optional on-chain responses
 * 
 * Key Features:
 * - Target by Twitter handle (not just wallet)
 * - Optional on-chain response (if target has crypto)
 * - Public roasts get tweeted regardless
 * - AI judge resolves on-chain battles
 */
contract RoastBattle is Ownable, ReentrancyGuard {
    IERC20 public roastToken;
    
    uint256 public battleCount;
    uint256 public minStake = 100 * 10**18; // 100 ROAST
    uint256 public platformFee = 5; // 5%
    
    struct Battle {
        uint256 id;
        address challenger;
        string targetTwitter;        // @handle of target
        address targetWallet;        // Optional: target's wallet if known
        uint256 pot;
        string challengerRoast;
        string defenderRoast;
        address winner;
        bool resolved;
        bool tweetedOut;             // Track if roast was tweeted
        uint256 createdAt;
    }
    
    // Twitter handle => linked wallet
    mapping(string => address) public twitterToWallet;
    
    // Wallet => Twitter handle  
    mapping(address => string) public walletToTwitter;
    
    // Battle ID => Battle
    mapping(uint256 => Battle) public battles;
    
    event BattleCreated(
        uint256 indexed battleId, 
        address indexed challenger, 
        string targetTwitter,
        address targetWallet,
        uint256 stake
    );
    
    event TwitterLinked(address indexed wallet, string twitterHandle);
    event RoastTweeted(uint256 indexed battleId, string targetTwitter);
    event RoastSubmitted(uint256 indexed battleId, address indexed participant, string roast);
    event BattleResolved(uint256 indexed battleId, address indexed winner, uint256 payout);
    
    constructor(address _roastToken) Ownable(msg.sender) {
        roastToken = IERC20(_roastToken);
    }
    
    /**
     * @dev Link your Twitter handle to your wallet
     * @param twitterHandle Your Twitter @handle (without @)
     */
    function linkTwitter(string memory twitterHandle) external {
        require(bytes(twitterHandle).length > 0, "Invalid handle");
        
        // Unlink previous handle if exists
        string memory oldHandle = walletToTwitter[msg.sender];
        if (bytes(oldHandle).length > 0) {
            delete twitterToWallet[oldHandle];
        }
        
        // Link new handle
        twitterToWallet[twitterHandle] = msg.sender;
        walletToTwitter[msg.sender] = twitterHandle;
        
        emit TwitterLinked(msg.sender, twitterHandle);
    }
    
    /**
     * @dev Create a roast battle targeting a Twitter handle
     * @param targetTwitter Target's @handle (without @)
     * @param targetWallet Target's wallet (0x0 if unknown)
     * @param roast Your roast text
     * @param stake Amount of ROAST to stake
     */
    function createBattle(
        string memory targetTwitter,
        address targetWallet,
        string memory roast,
        uint256 stake
    ) external nonReentrant {
        require(stake >= minStake, "Stake too low");
        require(bytes(targetTwitter).length > 0, "Invalid Twitter handle");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast length");
        
        // Transfer stake
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battleCount++;
        
        // If target wallet is 0x0, check if they have linked wallet
        if (targetWallet == address(0)) {
            targetWallet = twitterToWallet[targetTwitter];
        }
        
        battles[battleCount] = Battle({
            id: battleCount,
            challenger: msg.sender,
            targetTwitter: targetTwitter,
            targetWallet: targetWallet,
            pot: stake,
            challengerRoast: roast,
            defenderRoast: "",
            winner: address(0),
            resolved: false,
            tweetedOut: false,
            createdAt: block.timestamp
        });
        
        emit BattleCreated(battleCount, msg.sender, targetTwitter, targetWallet, stake);
        emit RoastSubmitted(battleCount, msg.sender, roast);
    }
    
    /**
     * @dev Mark battle as tweeted (called by backend bot)
     */
    function markTweeted(uint256 battleId) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(battle.id != 0, "Battle does not exist");
        
        battle.tweetedOut = true;
        emit RoastTweeted(battleId, battle.targetTwitter);
    }
    
    /**
     * @dev Respond to a roast battle (only if you're the target)
     * @param battleId Battle ID
     * @param roast Your counter-roast
     * @param stake Amount to stake (must match or exceed)
     */
    function respondToBattle(
        uint256 battleId,
        string memory roast,
        uint256 stake
    ) external nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Battle already resolved");
        require(bytes(battle.defenderRoast).length == 0, "Already responded");
        
        // Must be the target wallet
        require(
            msg.sender == battle.targetWallet || 
            msg.sender == twitterToWallet[battle.targetTwitter],
            "Not the target"
        );
        
        require(stake >= battle.pot, "Must match or exceed stake");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast");
        
        // Transfer stake
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battle.pot += stake;
        battle.defenderRoast = roast;
        battle.targetWallet = msg.sender; // Update wallet if it was 0x0
        
        emit RoastSubmitted(battleId, msg.sender, roast);
    }
    
    /**
     * @dev AI judge resolves battle
     */
    function resolveBattle(uint256 battleId, uint8 winnerId) external onlyOwner nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Already resolved");
        require(bytes(battle.defenderRoast).length > 0, "Defender hasn't responded");
        require(winnerId == 1 || winnerId == 2, "Invalid winner");
        
        address winner = winnerId == 1 ? battle.challenger : battle.targetWallet;
        
        uint256 fee = (battle.pot * platformFee) / 100;
        uint256 payout = battle.pot - fee;
        
        battle.winner = winner;
        battle.resolved = true;
        
        require(roastToken.transfer(winner, payout), "Payout failed");
        
        emit BattleResolved(battleId, winner, payout);
    }
    
    /**
     * @dev Auto-win if no response in 24 hours
     */
    function forfeit(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Already resolved");
        require(bytes(battle.defenderRoast).length == 0, "Defender responded");
        require(block.timestamp >= battle.createdAt + 24 hours, "Too early");
        
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
     * @dev Get linked wallet for Twitter handle
     */
    function getWalletForTwitter(string memory twitterHandle) external view returns (address) {
        return twitterToWallet[twitterHandle];
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = roastToken.balanceOf(address(this));
        require(balance > 0, "No fees");
        require(roastToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Update settings
     */
    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }
    
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10, "Fee too high");
        platformFee = _fee;
    }
}
