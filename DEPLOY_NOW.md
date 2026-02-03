# 🚀 DEPLOY NOW - 10 Minute Guide

**Current Time**: Need to deploy ASAP  
**Your Wallet**: `0x18A00B37725558a008E23794d4001065ddDD5432`  
**Balance**: 0.000044 ETH (should be enough for deployment)

---

## 🎯 STEP-BY-STEP (10 Minutes)

### STEP 1: Open Remix (30 seconds)

1. Open new browser tab
2. Go to: **https://remix.ethereum.org**
3. You'll see a file explorer on the left

### STEP 2: Create RoastToken.sol (1 minute)

1. In left sidebar, click **"contracts"** folder
2. Right-click → **"New File"**
3. Name it: **`RoastToken.sol`**
4. Copy this ENTIRE code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RoastToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18;
    
    constructor() ERC20("RoastChain Token", "ROAST") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

5. Paste into the editor
6. **Ctrl+S** to save

### STEP 3: Compile Token (1 minute)

1. Click **"Solidity Compiler"** icon on left (looks like 📊)
2. Set **Compiler**: `0.8.20` (use dropdown)
3. **Optimization**: Check the box ✅ and set to `200`
4. Click big blue **"Compile RoastToken.sol"** button
5. Wait for green checkmark ✅ (about 10 seconds)

### STEP 4: Deploy Token (2 minutes)

1. Click **"Deploy & Run"** icon on left (looks like ▶️)
2. **Environment**: Select **"Injected Provider - MetaMask"**
3. MetaMask popup appears → Click **"Connect"**
4. Select account: **`0x18A0...5432`**
5. MetaMask shows network → Switch to **"Base"** if not already
   - If Base not in list, click "Add Network" and enter:
     - Network Name: `Base`
     - RPC URL: `https://mainnet.base.org`
     - Chain ID: `8453`
     - Currency: `ETH`
6. **Contract**: Dropdown shows `RoastToken` - leave it selected
7. Click orange **"Deploy"** button
8. MetaMask popup → Click **"Confirm"**
9. Wait 5-10 seconds for confirmation
10. Look at bottom terminal - you'll see: **`[call] from: 0x18A0... to: RoastToken.(deployed)`**
11. Click the **copy icon** next to the address
12. **SAVE THIS ADDRESS** → Paste somewhere: **Token = `0x________________`**

### STEP 5: Create RoastBattle.sol (1 minute)

1. Right-click contracts folder → **"New File"**
2. Name: **`RoastBattle.sol`**
3. Copy this ENTIRE code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RoastBattle is Ownable, ReentrancyGuard {
    IERC20 public roastToken;
    
    uint256 public battleCount;
    uint256 public minStake = 100 * 10**18;
    uint256 public platformFee = 5;
    
    struct Battle {
        uint256 id;
        address challenger;
        string targetTwitter;
        address targetWallet;
        uint256 pot;
        string challengerRoast;
        string defenderRoast;
        address winner;
        bool resolved;
        bool tweetedOut;
        uint256 createdAt;
    }
    
    mapping(string => address) public twitterToWallet;
    mapping(address => string) public walletToTwitter;
    mapping(uint256 => Battle) public battles;
    
    event BattleCreated(uint256 indexed battleId, address indexed challenger, string targetTwitter, address targetWallet, uint256 stake);
    event TwitterLinked(address indexed wallet, string twitterHandle);
    event RoastTweeted(uint256 indexed battleId, string targetTwitter);
    event RoastSubmitted(uint256 indexed battleId, address indexed participant, string roast);
    event BattleResolved(uint256 indexed battleId, address indexed winner, uint256 payout);
    
    constructor(address _roastToken) Ownable(msg.sender) {
        roastToken = IERC20(_roastToken);
    }
    
    function linkTwitter(string memory twitterHandle) external {
        require(bytes(twitterHandle).length > 0, "Invalid handle");
        string memory oldHandle = walletToTwitter[msg.sender];
        if (bytes(oldHandle).length > 0) {
            delete twitterToWallet[oldHandle];
        }
        twitterToWallet[twitterHandle] = msg.sender;
        walletToTwitter[msg.sender] = twitterHandle;
        emit TwitterLinked(msg.sender, twitterHandle);
    }
    
    function createBattle(string memory targetTwitter, address targetWallet, string memory roast, uint256 stake) external nonReentrant {
        require(stake >= minStake, "Stake too low");
        require(bytes(targetTwitter).length > 0, "Invalid Twitter handle");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast length");
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battleCount++;
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
    
    function markTweeted(uint256 battleId) external onlyOwner {
        Battle storage battle = battles[battleId];
        require(battle.id != 0, "Battle does not exist");
        battle.tweetedOut = true;
        emit RoastTweeted(battleId, battle.targetTwitter);
    }
    
    function respondToBattle(uint256 battleId, string memory roast, uint256 stake) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.id != 0, "Battle does not exist");
        require(!battle.resolved, "Battle already resolved");
        require(bytes(battle.defenderRoast).length == 0, "Already responded");
        require(msg.sender == battle.targetWallet || msg.sender == twitterToWallet[battle.targetTwitter], "Not the target");
        require(stake >= battle.pot, "Must match or exceed stake");
        require(bytes(roast).length > 0 && bytes(roast).length <= 500, "Invalid roast");
        require(roastToken.transferFrom(msg.sender, address(this), stake), "Transfer failed");
        
        battle.pot += stake;
        battle.defenderRoast = roast;
        battle.targetWallet = msg.sender;
        emit RoastSubmitted(battleId, msg.sender, roast);
    }
    
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
    
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }
    
    function getWalletForTwitter(string memory twitterHandle) external view returns (address) {
        return twitterToWallet[twitterHandle];
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = roastToken.balanceOf(address(this));
        require(balance > 0, "No fees");
        require(roastToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }
    
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10, "Fee too high");
        platformFee = _fee;
    }
}
```

4. Paste and **Ctrl+S** to save

### STEP 6: Compile Battle (1 minute)

1. Click **"Solidity Compiler"** again
2. Same settings (0.8.20, optimization 200)
3. Click **"Compile RoastBattle.sol"**
4. Wait for green checkmark ✅

### STEP 7: Deploy Battle (2 minutes)

1. Click **"Deploy & Run"** again
2. **Contract**: Select **`RoastBattle`** from dropdown
3. You'll see a field appear: **`_ROASTTOKEN (address)`**
4. **Paste your token address from Step 4** into this field
   - Format: `0x...` (42 characters, including 0x)
5. Click orange **"Deploy"** button
6. MetaMask popup → **"Confirm"**
7. Wait 5-10 seconds
8. Copy the deployed address
9. **SAVE THIS**: **Battle = `0x________________`**

### STEP 8: Update Everything (2 minutes)

1. You now have TWO addresses:
   - Token: `0x...`
   - Battle: `0x...`

2. Run this command (I'll do it for you):
```bash
./update-contracts.sh 0xYOUR_TOKEN_ADDRESS 0xYOUR_BATTLE_ADDRESS
```

Or just **send me both addresses** and I'll update everything instantly!

---

## ✅ AFTER DEPLOYMENT

Send me:
```
Token: 0x...
Battle: 0x...
```

I will:
1. Update frontend/app.js
2. Redeploy to Vercel
3. Update all documentation
4. Push to GitHub
5. Tweet the announcement
6. Update hackathon submission

**ETA**: 2 minutes after you send addresses

---

## 🚨 TROUBLESHOOTING

**"Out of gas"**: Increase gas limit to 3,000,000 in MetaMask  
**"Nonce too low"**: Clear activity in MetaMask settings  
**"Wrong network"**: Switch to Base in MetaMask  
**"Can't find contract"**: Make sure you compiled first

---

**⏰ DO THIS NOW - 10 MINUTES TOTAL**

Just follow steps 1-7, send me the addresses, I'll do the rest! 🔥
