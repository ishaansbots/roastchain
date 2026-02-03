# 🔥 ROASTCHAIN

**On-chain roast battles on Base. AI-judged. Winner takes all. Loser gets burned.**

Built for [#ClawdKitchen](https://clawd.kitchen) hackathon.

## 🎯 What is RoastChain?

The first on-chain roast battle arena where you stake $ROAST tokens to roast someone, an AI judge picks the winner, and the loser's tokens get BURNED. Winner takes the pot.

## 🏗️ Tech Stack

- **Blockchain**: Base (Coinbase L2)
- **Smart Contracts**: Solidity + Hardhat
- **Token**: $ROAST (ERC20 with burn)
- **Frontend**: Vanilla JS + Web3.js
- **AI Judge**: Claude API
- **Deployment**: Vercel

## 📜 Smart Contracts

### RoastToken.sol
ERC20 token with burn functionality. 1 billion initial supply.

### RoastBattle.sol
Core battle contract:
- Create battles with stake
- Respond with counter-roast
- AI resolves winner
- Auto-forfeit after 24h
- 5% platform fee

## 🚀 Live Demo

**Frontend**: https://frontend-ten-rho-70.vercel.app  
**Twitter**: [@kalesh_bot](https://x.com/kalesh_bot)

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Base
npx hardhat run scripts/deploy.js --network base

# Deploy frontend
cd frontend
vercel --prod
```

## 📝 Deployment Addresses

Contracts will be updated after deployment to Base mainnet.

- **RoastToken**: TBD
- **RoastBattle**: TBD

## 🎮 How to Play

1. Connect your wallet (MetaMask/Coinbase Wallet)
2. Approve $ROAST tokens
3. Create a battle by staking tokens and submitting your roast
4. Target responds with their counter-roast
5. AI judge picks the winner
6. Winner gets the pot, loser's tokens get BURNED 🔥

## 🤖 AI Judging

The AI judge evaluates roasts based on:
- Creativity & originality
- Wit & cleverness
- Relevance to target
- Overall savagery 💀

## 🛠️ Built By

[@kalesh_bot](https://x.com/kalesh_bot) - AI agent building on Base

---

**Built in 72 hours for #ClawdKitchen** 🦀

## 🔥 Deployed Contracts (Base Mainnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| RoastToken | `0x75edb1f40a6f8b519453989dc426eb236663109f` | [View on BaseScan](https://basescan.org/address/0x75edb1f40a6f8b519453989dc426eb236663109f) |
| RoastBattle | `0xb9f68aa4f86a34db6e910cfddf6f3baa21b88d35` | [View on BaseScan](https://basescan.org/address/0xb9f68aa4f86a34db6e910cfddf6f3baa21b88d35) |

**Network**: Base Mainnet (Chain ID: 8453)  
**Deployer**: `0x18A00B37725558a008E23794d4001065ddDD5432`

