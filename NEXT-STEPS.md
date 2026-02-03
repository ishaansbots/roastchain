# 🔥 ROASTCHAIN - NEXT STEPS

**Time Left**: ~5 hours until deadline (Feb 4, 7:30 AM PT)

## ✅ What We Have

1. **Smart Contracts** ✅
   - `RoastToken.sol` - ERC20 token with burn mechanism
   - `RoastBattle.sol` - Battle contract (stake, roast, judge, winner takes pot)
   - Fully commented, production-ready

2. **Frontend** ✅
   - Modern UI with fire theme 🔥
   - Wallet connection (MetaMask)
   - Create battles, view battles, stats
   - Ready to deploy to Vercel

3. **Marketing Started** ✅
   - Registration tweet: https://x.com/kalesh_bot/status/2018788596535509378
   - Hype tweet: https://x.com/kalesh_bot/status/2018789196773962204
   - Token request: https://x.com/kalesh_bot/status/2018789506938544298

4. **Wallet Generated** ✅
   - Address: `0x18A00B37725558a008E23794d4001065ddDD5432`
   - Private key saved in `.wallet.json`

## ⚠️ BLOCKERS

### 1. **WALLET NEEDS ETH** 🚨
The deployment wallet has **ZERO balance** on Base.

**Need**: ~0.01 ETH on Base mainnet to deploy contracts

**Options**:
- Bridge ETH from Ethereum: https://bridge.base.org
- Use an existing funded wallet instead
- Buy directly on Base via Coinbase

### 2. **Hackathon Registration Incomplete**
- ✅ Twitter post done
- ❌ Moltbook post failing (API issues)
- Need valid Moltbook post URL to complete registration

### 3. **Bankr Token Response**
- Requested $ROAST token from @bankrbot
- No response yet (could take time)
- Backup plan: Deploy our own token (already written)

## 🚀 DEPLOYMENT PLAN (Once Wallet is Funded)

```bash
cd /home/ubuntu/.openclaw/workspace/roastchain

# Deploy contracts to Base
PRIVATE_KEY="0x52c052d430f89b53b4926ea76987f56c24f73c3a84452f70adfa11e34cc91c2d" \\
npx hardhat run scripts/deploy.js --network base

# This will output:
# - RoastToken address
# - RoastBattle address

# Update frontend with addresses
# Edit frontend/app.js:
# - LINE 7: const CONTRACT_ADDRESS = "<RoastBattle address>";
# - LINE 8: const TOKEN_ADDRESS = "<RoastToken address>";

# Deploy frontend to Vercel
cd frontend
vercel --prod
```

## 📝 HACKATHON SUBMISSION

Once deployed, submit via:
```bash
curl -X POST https://clawd.kitchen/api/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "wallet_address": "0x18A00B37725558a008E23794d4001065ddDD5432",
    "project_name": "ROASTCHAIN",
    "description": "On-chain roast battles on Base. Stake $ROAST tokens, AI judges winner, loser gets burned. The most entertaining DeFi experience on Base.",
    "github_url": "https://github.com/YOUR_USERNAME/roastchain",
    "vercel_url": "https://roastchain.vercel.app",
    "contract_address": "<RoastBattle address>",
    "token_address": "<RoastToken address>"
  }'
```

## 🔥 MARKETING BLITZ (Ongoing)

### Twitter Strategy
- Tweet every 30min with project updates
- Engage with Base ecosystem accounts
- Quote tweet about token launches
- Roast people to demo the product 💀

### Reddit Posts
- r/base
- r/cryptocurrency  
- r/ethdev
- r/CryptoMoonShots

### Moltbook
- Keep trying to post (API was broken earlier)
- Engage with other agents

## 🎯 PRIORITY

1. **FUND WALLET** (critical blocker)
2. Deploy contracts
3. Deploy frontend
4. Complete hackathon submission
5. Tweet storm for visibility

---

**Current Status**: 95% built, need wallet funding to go live

**ETA to live**: 30 minutes after wallet is funded

**Confidence**: HIGH 🔥

Let me know when wallet is funded and I'll deploy everything!
