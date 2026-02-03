# 🧪 Base Sepolia Testnet Deployment

**Why testnet**: Mainnet wallet ran out of ETH, deploying to testnet for now to test everything works.

## Step 1: Get Free Testnet ETH (2 minutes)

**Your Address**: `0x18A00B37725558a008E23794d4001065ddDD5432`

### Option A: Coinbase Wallet Faucet (EASIEST)
1. Go to: https://portal.cdp.coinbase.com/products/faucet
2. Connect wallet or paste address: `0x18A00B37725558a008E23794d4001065ddDD5432`
3. Select "Base Sepolia"
4. Click "Get testnet ETH"
5. Wait ~30 seconds

### Option B: Alchemy Faucet
1. Go to: https://www.alchemy.com/faucets/base-sepolia
2. Sign in (free account)
3. Paste address: `0x18A00B37725558a008E23794d4001065ddDD5432`
4. Complete captcha
5. Click "Send Me ETH"

### Option C: QuickNode Faucet
1. Go to: https://faucet.quicknode.com/base/sepolia
2. Paste address
3. Complete captcha
4. Get 0.05 ETH

## Step 2: Deploy Contracts (Automated - 2 minutes)

Once you have testnet ETH:

```bash
cd /home/ubuntu/.openclaw/workspace/roastchain
node deploy-sepolia.mjs
```

This will:
- ✅ Compile both contracts
- ✅ Deploy RoastToken to Base Sepolia
- ✅ Deploy RoastBattle to Base Sepolia
- ✅ Save addresses to `deployed-addresses-sepolia.json`
- ✅ Print BaseScan links

## Step 3: Update Everything (Automated - 1 minute)

```bash
./update-contracts.sh <TOKEN_ADDR> <BATTLE_ADDR>
```

This will:
- Update frontend with contract addresses
- Add testnet warning banner
- Redeploy to Vercel
- Update all documentation
- Push to GitHub
- Tweet deployment announcement

## What Changes for Testnet?

**Frontend updates**:
- ⚠️ Banner: "Running on Base Sepolia Testnet"
- 🌐 Network: Users need to add Base Sepolia to MetaMask
- 🪙 Token: Link to get testnet tokens
- 🚰 Faucet link for users to get testnet ETH

**Still works**:
- ✅ Full roast battle functionality
- ✅ Token staking
- ✅ AI judge integration
- ✅ Twitter handle → wallet mapping
- ✅ All UI/UX features

## Later: Mainnet Migration

When ready to deploy to Base mainnet:
1. Get 0.001 ETH on Base mainnet
2. Run `node compile-and-deploy.mjs` (original script)
3. Run update script with mainnet addresses
4. Remove testnet banner
5. Redeploy

---

**Current Status**: Waiting for testnet ETH  
**Next**: Get ETH from faucet → Deploy → Update → Resubmit
