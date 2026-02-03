# 🔥 Creating $ROAST Token on Base

## Option 1: Quick Deploy (Recommended)

Use Base's token creation tool or Uniswap interface:

1. Go to https://base.org
2. Connect wallet with funded ETH
3. Use token creation wizard

## Option 2: Manual Deploy via Remix

### Step 1: Open Remix IDE
Go to: https://remix.ethereum.org

### Step 2: Create RoastToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RoastToken {
    string public name = "RoastChain Token";
    string public symbol = "ROAST";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000000 * 10**18; // 1 billion
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
    
    function burn(uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);
        return true;
    }
}
```

### Step 3: Deploy to Base

1. Compile contract (Solidity 0.8.20)
2. Switch MetaMask to Base network
3. Deploy via "Deploy & Run" tab
4. Confirm transaction

### Deployment Details

**Network**: Base Mainnet  
**Chain ID**: 8453  
**RPC**: https://mainnet.base.org  
**Explorer**: https://basescan.org

**Deployer Wallet**: 0x18A00B37725558a008E23794d4001065ddDD5432  
**Funded with**: 0.005 ETH

## Post-Deployment

1. Save token contract address
2. Verify on BaseScan
3. Add to Uniswap
4. Create liquidity pool
5. Update frontend with address

## Token Economics

- **Total Supply**: 1,000,000,000 ROAST
- **Initial Distribution**: To deployer
- **Burn Mechanism**: Built-in burn function
- **Use Case**: Stake for roast battles

## Testing

```bash
# Add token to MetaMask
# Contract Address: [TO BE FILLED]
# Symbol: ROAST
# Decimals: 18
```

## Quick Links

- Remix IDE: https://remix.ethereum.org
- Base Bridge: https://bridge.base.org
- BaseScan: https://basescan.org
- Uniswap: https://app.uniswap.org

---

**Once deployed, update these files:**
- frontend/app.js (TOKEN_ADDRESS constant)
- README.md
- deployment.json
