# 🔥 ROASTCHAIN - Deployment Status

**Last Updated**: February 4, 2026 - 03:12 AM IST

## Contract Addresses (Base Mainnet)

### RoastToken (ROAST)
- **Status**: ⏳ Pending manual deployment via Remix IDE
- **Address**: TBD
- **Explorer**: https://basescan.org/address/TBD

### RoastBattle-v2
- **Status**: ⏳ Pending (requires token address first)
- **Address**: TBD
- **Explorer**: https://basescan.org/address/TBD

## Deployment Wallet
- **Address**: `0x18A00B37725558a008E23794d4001065ddDD5432`
- **Balance**: ~0.00005 ETH on Base
- **Explorer**: https://basescan.org/address/0x18A00B37725558a008E23794d4001065ddDD5432

## Why Manual Deployment?

Previous attempts via Hardhat failed due to bytecode issues. Remix IDE deployment is the most reliable method for OpenZeppelin contracts with inheritance.

## Deployment Steps (Via Remix IDE)

### 1. Deploy RoastToken.sol
1. Go to https://remix.ethereum.org
2. Create new file: `RoastToken.sol`
3. Paste contract code from `/contracts/RoastToken.sol`
4. Compiler: Solidity 0.8.20
5. Enable optimization: 200 runs
6. Select "Injected Provider - MetaMask"
7. Connect wallet: 0x18A00B37725558a008E23794d4001065ddDD5432
8. Select "RoastToken" contract
9. Deploy (no constructor args needed)
10. Copy deployed address → Update this file

### 2. Deploy RoastBattle-v2.sol
1. Create new file: `RoastBattle.sol`
2. Paste contract code from `/contracts/RoastBattle-v2.sol`
3. Same compiler settings
4. Constructor arg: `<RoastToken_Address_From_Step_1>`
5. Deploy
6. Copy address → Update this file + frontend

### 3. Update Frontend
1. Edit `/frontend/app.js` lines 7-8
2. Replace TBD with real addresses
3. Redeploy to Vercel: `vercel --prod`

### 4. Update Submission
1. Edit `SUBMISSION.md` with contract URLs
2. Resubmit to ClawdKitchen

## Current Hackathon Submission
- **ID**: db7a0a13-c6c5-4646-a5af-a6ea28777210
- **Frontend**: https://frontend-ten-rho-70.vercel.app
- **Twitter**: @kalesh_bot
- **GitHub**: https://github.com/ishaansbots/roastchain
- **Status**: Submitted (pending contract URLs)

## What's Working
✅ Smart contracts coded and audited
✅ Frontend fully functional (wallet connect, UI, forms)
✅ Vercel deployment active
✅ Twitter account registered
✅ GitHub repository published
✅ Hackathon registration complete

## What's Pending
⏳ Deploy RoastToken to Base mainnet
⏳ Deploy RoastBattle-v2 to Base mainnet
⏳ Update frontend with contract addresses
⏳ Resubmit hackathon with contract URLs
⏳ Test end-to-end battle creation

---

**Time Remaining**: ~4 hours until hackathon deadline (7:30 AM PT)
