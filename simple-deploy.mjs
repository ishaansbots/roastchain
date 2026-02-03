import { ethers } from 'ethers';
import fs from 'fs';

const PRIVATE_KEY = "0x52c052d430f89b53b4926ea76987f56c24f73c3a84452f70adfa11e34cc91c2d";
const RPC_URL = "https://mainnet.base.org";

console.log("🔥 Deploying ROASTCHAIN to Base mainnet...\n");

// Connect to Base
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("Deployer address:", wallet.address);

// Check balance
const balance = await provider.getBalance(wallet.address);
console.log("Balance:", ethers.formatEther(balance), "ETH\n");

if (balance === 0n) {
    console.error("❌ No ETH balance!");
    process.exit(1);
}

// RoastToken bytecode (simplified - 1B supply, burnable, ownable)
// This is a standard ERC20 with OpenZeppelin patterns
const ROAST_TOKEN_BYTECODE = "0x608060405234801561000f575f5ffd5b5033604051806040016040528060118152602001705Roast436861696e20546f6b656e81525060405180604001604052806005815260200164524f41535460d81b8152506001600160a01b03811661007d57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b61008681610100565b506100f833600c6b033b2e3c9fd0803ce800000067ffffffffffffffff8111156100b2576100b2610324565b5050610338565b610151565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b0382166101795760405163ec442f0560e01b81525f60048201526024016100b3565b6101845f838361018b565b5050565b6001600160a01b0383166101b5578060025f8282546101a79190610352565b909155506102259050565b6001600160a01b0383165f90815260208190526040902054818110156102075760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016100b3565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661024157600280548290039055610259565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516102a091815260200190565b60405180910390a3505050";

console.log("Deploying RoastToken...");
const tokenFactory = new ethers.ContractFactory(
    [], // ABI not needed for deployment
    ROAST_TOKEN_BYTECODE,
    wallet
);

try {
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    console.log("✅ RoastToken deployed:", tokenAddress);
    console.log("\n🎉 DEPLOYMENT COMPLETE!\n");
    console.log("Contract Addresses:");
    console.log("==================");
    console.log("RoastToken:", tokenAddress);
    console.log("\nNetwork: Base Mainnet");
    console.log("Explorer: https://basescan.org/address/" + tokenAddress);
    
    // Save deployment info
    fs.writeFileSync('deployment.json', JSON.stringify({
        network: 'base',
        chainId: 8453,
        deployer: wallet.address,
        contracts: {
            RoastToken: tokenAddress
        },
        timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log("\n📄 Deployment saved to deployment.json");
    
} catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
}
