import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🔥 Deploying ROASTCHAIN contracts to Base...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ ERROR: No ETH balance! Please fund the wallet:");
    console.error("Address:", deployer.address);
    console.error("\nGet Base ETH from:");
    console.error("- Bridge: https://bridge.base.org");
    console.error("- Faucet (testnet): https://faucet.quicknode.com/base");
    process.exit(1);
  }

  // Deploy RoastToken
  console.log("📝 Deploying RoastToken...");
  const RoastToken = await hre.ethers.getContractFactory("RoastToken");
  const token = await RoastToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ RoastToken deployed to:", tokenAddress);

  // Deploy RoastBattle
  console.log("\n📝 Deploying RoastBattle...");
  const RoastBattle = await hre.ethers.getContractFactory("RoastBattle");
  const battle = await RoastBattle.deploy(tokenAddress);
  await battle.waitForDeployment();
  const battleAddress = await battle.getAddress();
  console.log("✅ RoastBattle deployed to:", battleAddress);

  // Summary
  console.log("\n🎉 DEPLOYMENT COMPLETE!\n");
  console.log("Contract Addresses:");
  console.log("==================");
  console.log("RoastToken:  ", tokenAddress);
  console.log("RoastBattle: ", battleAddress);
  console.log("\nNetwork:     Base Mainnet (Chain ID: 8453)");
  console.log("Deployer:    ", deployer.address);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on BaseScan");
  console.log("2. Update frontend/app.js with contract addresses");
  console.log("3. Add liquidity to token (optional)");
  console.log("4. Deploy frontend to Vercel");
  console.log("\n🔥 ROASTCHAIN IS LIVE! 🔥");

  // Save deployment info
  const deploymentInfo = {
    network: 'base',
    chainId: 8453,
    deployer: deployer.address,
    contracts: {
      RoastToken: tokenAddress,
      RoastBattle: battleAddress
    },
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📄 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
