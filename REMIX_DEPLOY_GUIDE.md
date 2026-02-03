# 🎯 REMIX IDE DEPLOYMENT - Quick Guide

**Time Required**: 10 minutes  
**Cost**: ~0.01 ETH gas fees on Base

---

## STEP 1: Deploy RoastToken (5 minutes)

### 1.1 Open Remix
- Go to: https://remix.ethereum.org

### 1.2 Create File
- Left sidebar → Click "contracts" folder
- Click 📄 icon (New File)
- Name: `RoastToken.sol`

### 1.3 Paste Code
```solidity
// Copy entire content from:
/home/ubuntu/.openclaw/workspace/roastchain/contracts/RoastToken.sol

// Or from GitHub:
https://github.com/ishaansbots/roastchain/blob/main/contracts/RoastToken.sol
```

### 1.4 Compile
- Left sidebar → Click "Solidity Compiler" icon (📊)
- **Compiler**: `0.8.20`
- **EVM Version**: default
- **Optimization**: ✅ Enabled, `200` runs
- Click **"Compile RoastToken.sol"**
- Wait for green checkmark ✅

### 1.5 Deploy
- Left sidebar → Click "Deploy & Run" icon (▶️)
- **Environment**: Select `Injected Provider - MetaMask`
- MetaMask popup → Connect wallet `0x18A00B37725558a008E23794d4001065ddDD5432`
- Switch network to **Base** (Chain ID: 8453)
- **Contract**: Select `RoastToken` from dropdown
- Click **Deploy** (orange button)
- MetaMask → Confirm transaction
- Wait ~5 seconds for confirmation

### 1.6 Copy Address
- Look for green text at bottom:
  ```
  [call] from: 0x18A0... to: RoastToken (deployed)
  ```
- Click the copy icon next to contract address
- **SAVE THIS**: RoastToken = `0x_______________________`

---

## STEP 2: Deploy RoastBattle (5 minutes)

### 2.1 Create File
- Same Remix window
- Create new file: `RoastBattle.sol`

### 2.2 Paste Code
```solidity
// Copy entire content from:
/home/ubuntu/.openclaw/workspace/roastchain/contracts/RoastBattle-v2.sol

// Or from GitHub:
https://github.com/ishaansbots/roastchain/blob/main/contracts/RoastBattle-v2.sol
```

### 2.3 Compile
- Click "Solidity Compiler" icon
- Same settings (0.8.20, optimization 200)
- Click **"Compile RoastBattle.sol"**
- Green checkmark ✅

### 2.4 Deploy with Constructor
- Click "Deploy & Run" icon
- **Contract**: Select `RoastBattle` from dropdown
- **Constructor argument**:
  - Field will appear: `_roastToken (address)`
  - Paste your RoastToken address from Step 1.6
  - Format: `0x...` (42 characters)
- Click **Deploy**
- MetaMask → Confirm
- Wait ~5 seconds

### 2.5 Copy Address
- **SAVE THIS**: RoastBattle = `0x_______________________`

---

## STEP 3: Verify Deployment

### 3.1 Check on BaseScan
- Token: `https://basescan.org/address/<YOUR_TOKEN_ADDRESS>`
- Battle: `https://basescan.org/address/<YOUR_BATTLE_ADDRESS>`
- Should see contract code and deployment transaction

### 3.2 Test Token
In Remix, under "Deployed Contracts":
- Expand `RoastToken` contract
- Click `totalSupply` (blue button)
- Should return: `1000000000000000000000000000` (1 billion with 18 decimals)

### 3.3 Test Battle
- Expand `RoastBattle` contract
- Click `roastToken` (blue button)
- Should return your token address
- Click `minStake` (blue button)
- Should return: `100000000000000000000` (100 tokens)

---

## STEP 4: Update Frontend

### 4.1 Edit app.js
```bash
cd /home/ubuntu/.openclaw/workspace/roastchain/frontend
nano app.js
```

Find lines 7-8 and update:
```javascript
const TOKEN_ADDRESS = "0xYOUR_TOKEN_ADDRESS_HERE";
const BATTLE_ADDRESS = "0xYOUR_BATTLE_ADDRESS_HERE";
```

Save: `Ctrl+X`, `Y`, `Enter`

### 4.2 Redeploy Frontend
```bash
cd /home/ubuntu/.openclaw/workspace/roastchain/frontend
vercel --prod
```

Wait for deployment URL, test it.

---

## STEP 5: Update Documentation

### 5.1 Update SUBMISSION.md
```bash
cd /home/ubuntu/.openclaw/workspace/roastchain
nano SUBMISSION.md
```

Find the "Smart Contract Addresses" section and update:
```markdown
### Smart Contract Addresses (Base Mainnet)

- **RoastToken**: `0xYOUR_TOKEN_ADDRESS`
- **RoastBattle**: `0xYOUR_BATTLE_ADDRESS`
- **Deployer Wallet**: `0x18A00B37725558a008E23794d4001065ddDD5432`
- **Base Explorer**: https://basescan.org
```

### 5.2 Update DEPLOYMENT_STATUS.md
Same file, update the "Contract Addresses" section.

### 5.3 Commit to GitHub
```bash
git add .
git commit -m "✅ Deployed contracts to Base mainnet"
git push origin main
```

---

## STEP 6: Announce Update

### Twitter Update
Tweet from @kalesh_bot:
```
🔥 ROASTCHAIN LIVE ON BASE! 🔥

✅ Token: 0x...
✅ Battle: 0x...
✅ Frontend: https://frontend-ten-rho-70.vercel.app

On-chain roast battles are NOW LIVE. Stake, roast, win. Loser gets BURNED. 💀

#ClawdKitchen #Base #DeFi
```

### GitHub README
Update README.md with contract addresses.

---

## 🚨 TROUBLESHOOTING

### "Out of Gas" Error
- Increase gas limit in MetaMask (e.g., 3,000,000)
- Or deploy during low-traffic time

### "Nonce Too Low"
- MetaMask → Settings → Advanced → Clear Activity Tab Data
- Retry deployment

### "Cannot Read Property" Error
- Make sure you selected the correct contract from dropdown
- Both files must be compiled before deploying

### Wrong Network
- MetaMask → Switch Network → Base
- Or manually add Base:
  - Network Name: Base
  - RPC URL: https://mainnet.base.org
  - Chain ID: 8453
  - Currency: ETH
  - Explorer: https://basescan.org

---

## ✅ DEPLOYMENT CHECKLIST

```
[ ] Remix opened
[ ] RoastToken.sol created and pasted
[ ] RoastToken compiled (0.8.20, optimization 200)
[ ] Connected MetaMask (0x18A0...)
[ ] Switched to Base network
[ ] RoastToken deployed
[ ] Token address copied: 0x_______________
[ ] RoastBattle.sol created and pasted
[ ] RoastBattle compiled
[ ] RoastBattle deployed with token address
[ ] Battle address copied: 0x_______________
[ ] BaseScan verified both contracts exist
[ ] Tested totalSupply() on token
[ ] Tested roastToken() on battle
[ ] Updated frontend/app.js
[ ] Redeployed frontend (vercel --prod)
[ ] Updated SUBMISSION.md
[ ] Updated DEPLOYMENT_STATUS.md
[ ] Committed to GitHub
[ ] Tweeted announcement
[ ] DONE! 🎉
```

---

**Questions?** Drop a message. I can walk you through any step. 💪
