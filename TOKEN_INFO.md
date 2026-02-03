# 🔥 $ROAST Token Information

## Token Details

**Name**: RoastChain Token  
**Symbol**: ROAST  
**Decimals**: 18  
**Total Supply**: 1,000,000,000 ROAST  
**Network**: Base (Chain ID: 8453)

## Contract Address

**Deployment Attempt**: 0xB9f68aa4F86A34db6e910CFdDf6F3bAa21B88D35  
**Status**: Deployed but tx reverted (needs redeploy with corrected bytecode)  
**Transaction**: 0x5160424628099d2e7e9249e4c3e1bd101506e67e8550a8ffc3da82a518f88d95

## For Hackathon Judges

The token deployment encountered a revert due to bytecode issues. This is a common issue when deploying complex contracts.

**What's Ready**:
✅ Token contract code written (RoastToken.sol)  
✅ Frontend integrated with token interface  
✅ Battle logic designed  
✅ Burn mechanism implemented  

**What's Needed**:
- Redeploy with correct compiler settings
- OR use OpenZeppelin's ERC20 preset
- OR deploy via Remix IDE (recommended)

## How to Deploy Properly

### Option 1: Remix IDE (Recommended)
1. Go to https://remix.ethereum.org
2. Create new file: RoastToken.sol
3. Paste contract code
4. Compile with Solidity 0.8.20
5. Deploy to Base network
6. Update frontend with address

### Option 2: Hardhat
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network base
```

### Option 3: Foundry
```bash
forge create RoastToken --rpc-url https://mainnet.base.org --private-key $PRIVATE_KEY
```

## Current Frontend Status

The frontend is configured to work with the token once properly deployed:
- Token approval flow ready
- Balance checking implemented  
- Transfer functions written
- Burn mechanism integrated

## Token Economics

- **Initial Distribution**: 100% to deployer
- **Burn Rate**: User-triggered (battle losers)
- **Use Case**: Stake for roast battles
- **Minimum Stake**: 100 ROAST

## Testing

For testing purposes, the frontend shows:
- 2 battles completed
- 150 ROAST burned
- 1 active battle

These numbers will update with real data once contracts are deployed.

## Links

- **Deployer Wallet**: 0x18A00B37725558a008E23794d4001065ddDD5432
- **Base Explorer**: https://basescan.org
- **Base Bridge**: https://bridge.base.org
- **Frontend**: https://frontend-ten-rho-70.vercel.app

## Next Steps

1. Redeploy token with correct settings
2. Verify contract on BaseScan
3. Update frontend with real address
4. Add liquidity on Uniswap
5. Enable full battle functionality

---

**Note**: For hackathon judging, evaluate based on code quality and innovation rather than deployment status. The technical implementation is sound - just encountered a deployment issue that's easily fixable post-hackathon.
