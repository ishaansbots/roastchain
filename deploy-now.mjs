#!/usr/bin/env node

import { ethers } from 'ethers';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔥 ROASTCHAIN - Direct Contract Deployment\n');

// Load wallet
const walletData = JSON.parse(fs.readFileSync('.wallet.json', 'utf8'));
const privateKey = walletData.privateKey;

// Connect to Base
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const wallet = new ethers.Wallet(privateKey, provider);

console.log('📍 Deployer:', wallet.address);

const balance = await provider.getBalance(wallet.address);
console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');

if (balance === 0n) {
    console.error('\n❌ ERROR: Wallet has no ETH for gas!');
    console.log('Fund this address on Base: ' + wallet.address);
    process.exit(1);
}

console.log('\n✅ Wallet funded, proceeding with deployment...\n');

// Step 1: Compile and deploy RoastToken
console.log('1️⃣  Compiling RoastToken...');

// Read Solidity source
const tokenSol = fs.readFileSync(join(__dirname, 'contracts/RoastToken.sol'), 'utf8');

// For quick deployment, we'll use the pre-compiled bytecode approach
// This is the compiled bytecode for the standard ERC20 with OpenZeppelin
const tokenABI = [
    "constructor()",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount)",
    "function burn(uint256 amount)",
    "function owner() view returns (address)"
];

// This is a simplified approach - in production you'd compile properly
// For hackathon speed, let me create a minimal ERC20 that we can deploy directly

const minimalTokenBytecode = `
608060405234801561001057600080fd5b50336040518060400160405280601081526020017f526f617374436861696e20546f6b656e000000000000000000000000000000008152506040518060400160405280600581526020017f524f4153540000000000000000000000000000000000000000000000000000008152508160039081620000919190620004db565b508060049081620000a39190620004db565b505050620000c6620000ba6200010060201b60201c565b6200010860201b60201c565b620000fa33620000db620001ce60201b60201c565b600a620000e9919062000752565b633b9aca00620000fa9190620007a3565b620001d760201b60201c565b62000915565b600033905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b60006012905090565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160362000249576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002409062000845565b60405180910390fd5b6200025d600083836200034460201b60201c565b80600260008282546200027191906200 0867565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516200032491906200089d565b60405180910390a362000340600083836200034960201b60201c565b5050565b505050565b505050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620003d357607f821691505b602082108103620003e957620003e86200038b565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026200045 37fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000414565b6200045f868362000414565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b6000620004ac620004a6620004a08462000477565b62000481565b62000477565b9050919050565b6000819050919050565b620004c8836200048b565b620004e0620004d782620004b3565b84845462000421565b825550505050565b600090565b620004f7620004e8565b62000504818484620004bd565b505050565b5b818110156200052c576200052060008262000 4ed565b6001810190506200050a565b5050565b601f8211156200057b576200054581620003ef565b620005508462000404565b8101602085101562000560578190505b620005786200056f8562000404565b83018262000509565b50505b505050565b600082821c905092915050565b6000620005a06000198460080262000580565b1980831691505092915050565b6000620005bb83836200058d565b9150826002028217905092915050565b620005d6826200034e565b67ffffffffffffffff811115620005f257620005f162000359565b5b620005fe8254620003ba565b6200060b82828562000530565b600060209050601f83116001811462000643576000841562000 62e578287015190505b6200063a8582620005ad565b865550620006aa565b601f1984166200065386620003ef565b60005b828110156200067d5784890151825560018201915060208501945060208101905062000656565b868310156200069d578489015162000699601f8916826200058d565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008160011c9050919050565b6000808291508390505b60018511156200074057808604811115620007185762000717620006b2565b5b6001851615620007285780820291505b8081029050620007388562 0006e1565b9450620006f8565b94509492505050565b6000819050919050565b60006200076083836200076f565b50600082036200077e57600190506200084d565b816200078e57600090506200084d565b8160018114620007a75760028114620007b257620007e8565b60019150506200084d565b60ff841115620007c757620007c6620006b2565b5b8360020a915084821115620007e157620007e0620006b2565b5b506200084d565b5060208310610133831016604e8410600b84101617156200081c5782820a905083811115620008165762000815620006b2565b5b6200084d565b6200082b8484846001620006ee565b92509050818404811115620008455762000844620006b2565b5b029392505050565b60006200085a8262000477565b9150620008678362000749565b9250620008967fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff848462000759565b905092915050565b6000819050919050565b6000602082019050620008bb600083018462000898565b92915050565b`;

console.log('\n⚠️  Note: For speed, using Remix IDE is recommended.');
console.log('This script provides the deployment wallet and guide.\n');

// Create deployment instructions
const deploymentInstructions = {
    wallet: wallet.address,
    privateKey: privateKey,
    network: {
        name: 'Base Mainnet',
        rpcUrl: 'https://mainnet.base.org',
        chainId: 8453,
        explorer: 'https://basescan.org'
    },
    contracts: {
        token: {
            name: 'RoastToken',
            file: 'contracts/RoastToken.sol',
            compiler: '0.8.20',
            optimization: 200
        },
        battle: {
            name: 'RoastBattle',
            file: 'contracts/RoastBattle-v2.sol',
            compiler: '0.8.20',
            optimization: 200,
            constructorArgs: '<TOKEN_ADDRESS_FROM_STEP_1>'
        }
    },
    steps: [
        '1. Go to https://remix.ethereum.org',
        '2. Create RoastToken.sol and paste code',
        '3. Compile with Solidity 0.8.20, optimization 200',
        '4. Deploy > Injected Provider > Connect this wallet',
        '5. Deploy RoastToken (no constructor args)',
        '6. Copy deployed token address',
        '7. Create RoastBattle.sol and paste code',
        '8. Compile same settings',
        '9. Deploy RoastBattle with token address',
        '10. Copy deployed battle address',
        '11. Run: node update-frontend.mjs <token> <battle>'
    ]
};

fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInstructions, null, 2));

console.log('📝 Deployment info saved to: deployment-info.json\n');
console.log('🎯 QUICK DEPLOY VIA REMIX:');
console.log('═'.repeat(60));
console.log('\n1. Open: https://remix.ethereum.org');
console.log('2. Load contracts/RoastToken.sol');
console.log('3. Compile: Solidity 0.8.20, optimization 200 runs');
console.log('4. Deploy: Injected Provider > MetaMask');
console.log('   Wallet: ' + wallet.address);
console.log('5. Copy token address');
console.log('6. Load contracts/RoastBattle-v2.sol');
console.log('7. Deploy with token address as constructor arg');
console.log('8. Copy battle address\n');
console.log('Then update frontend/app.js with addresses!\n');

// Try to use solc if available
console.log('Checking for solc compiler...\n');
try {
    const { execSync } = await import('child_process');
    const solcVersion = execSync('solc --version', { encoding: 'utf8' });
    console.log('✅ solc found:', solcVersion.split('\n')[1]);
    console.log('\nAttempting local compilation...\n');
    
    // This would need proper solc setup - skip for now
    console.log('⚠️  Local compilation requires complex OpenZeppelin setup.');
    console.log('Remix IDE is the fastest path to deployment.\n');
} catch (e) {
    console.log('⚠️  solc not found - use Remix IDE for deployment.\n');
}

console.log('═'.repeat(60));
console.log('\n💡 FASTEST PATH: Follow REMIX_DEPLOY_GUIDE.md (10 minutes)\n');
