#!/bin/bash
echo "🚰 Requesting Base Sepolia testnet ETH..."
echo "📍 Address: 0x18A00B37725558a008E23794d4001065ddDD5432"
echo ""
echo "Trying Alchemy faucet..."

# Try Alchemy API faucet (usually works)
curl -X POST https://base-sepolia-faucet.pk910.de/api/getFaucet \
  -H "Content-Type: application/json" \
  -d '{"address":"0x18A00B37725558a008E23794d4001065ddDD5432"}' \
  2>&1

echo ""
echo "Waiting 10 seconds for tx to confirm..."
sleep 10

# Check balance
curl -s https://sepolia.base.org -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x18A00B37725558a008E23794d4001065ddDD5432", "latest"],"id":1}' \
  | jq -r '.result' | xargs -I {} node -e "console.log('Balance:', parseInt('{}', 16) / 1e18, 'ETH')"
