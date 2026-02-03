#!/usr/bin/env node

import solc from 'solc';
import fs from 'fs-extra';
import { ethers } from 'ethers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 ROASTCHAIN - Automated Contract Deployment\n');

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
    process.exit(1);
}

console.log('\n✅ Wallet funded, proceeding...\n');

// ==== STEP 1: COMPILE CONTRACTS ====
console.log('1️⃣  Compiling RoastToken.sol...');

const tokenSource = fs.readFileSync(path.join(__dirname, 'contracts/RoastToken.sol'), 'utf8');
const battleSource = fs.readFileSync(path.join(__dirname, 'contracts/RoastBattle-v2.sol'), 'utf8');

// Prepare input for solc
const input = {
    language: 'Solidity',
    sources: {
        'RoastToken.sol': { content: tokenSource },
        'RoastBattle.sol': { content: battleSource }
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

// Import callback to resolve OpenZeppelin imports
function findImports(importPath) {
    try {
        if (importPath.startsWith('@openzeppelin/')) {
            const contractPath = path.join(__dirname, 'node_modules', importPath);
            const source = fs.readFileSync(contractPath, 'utf8');
            return { contents: source };
        }
        return { error: 'File not found' };
    } catch (e) {
        return { error: 'File not found: ' + e.message };
    }
}

// Compile
console.log('   Compiling with OpenZeppelin imports...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

// Check for errors
if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
        console.error('\n❌ COMPILATION ERRORS:');
        errors.forEach(err => console.error(err.formattedMessage));
        process.exit(1);
    }
    // Show warnings
    const warnings = output.errors.filter(e => e.severity === 'warning');
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(w => console.log('  -', w.message));
    }
}

console.log('   ✅ Compilation successful!\n');

// Extract compiled contracts
const tokenContract = output.contracts['RoastToken.sol']['RoastToken'];
const battleContract = output.contracts['RoastBattle.sol']['RoastBattle'];

const tokenABI = tokenContract.abi;
const tokenBytecode = '0x' + tokenContract.evm.bytecode.object;

const battleABI = battleContract.abi;
const battleBytecode = '0x' + battleContract.evm.bytecode.object;

console.log('📦 Token bytecode size:', tokenBytecode.length, 'characters');
console.log('📦 Battle bytecode size:', battleBytecode.length, 'characters\n');

// ==== STEP 2: DEPLOY ROAST TOKEN ====
console.log('2️⃣  Deploying RoastToken to Base mainnet...');

try {
    const TokenFactory = new ethers.ContractFactory(tokenABI, tokenBytecode, wallet);
    
    console.log('   Deploying with optimized gas...');
    const tokenInstance = await TokenFactory.deploy({
        gasLimit: 1200000 // Optimized gas limit
    });
    
    console.log('   Transaction sent:', tokenInstance.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    
    await tokenInstance.waitForDeployment();
    const tokenAddress = await tokenInstance.getAddress();
    
    console.log('   ✅ RoastToken deployed at:', tokenAddress);
    console.log('   🔗 BaseScan:', `https://basescan.org/address/${tokenAddress}\n`);
    
    // ==== STEP 3: DEPLOY ROAST BATTLE ====
    console.log('3️⃣  Deploying RoastBattle with token address...');
    
    const BattleFactory = new ethers.ContractFactory(battleABI, battleBytecode, wallet);
    
    console.log('   Deploying with optimized gas...');
    const battleInstance = await BattleFactory.deploy(tokenAddress, {
        gasLimit: 2000000 // Optimized gas limit
    });
    
    console.log('   Transaction sent:', battleInstance.deploymentTransaction().hash);
    console.log('   Waiting for confirmation...');
    
    await battleInstance.waitForDeployment();
    const battleAddress = await battleInstance.getAddress();
    
    console.log('   ✅ RoastBattle deployed at:', battleAddress);
    console.log('   🔗 BaseScan:', `https://basescan.org/address/${battleAddress}\n`);
    
    // ==== STEP 4: VERIFY DEPLOYMENT ====
    console.log('4️⃣  Verifying deployment...');
    
    // Check token supply
    const totalSupply = await tokenInstance.totalSupply();
    console.log('   Token supply:', ethers.formatEther(totalSupply), 'ROAST');
    
    // Check battle contract has correct token address
    const linkedToken = await battleInstance.roastToken();
    console.log('   Battle token address:', linkedToken);
    console.log('   Match:', linkedToken === tokenAddress ? '✅' : '❌');
    
    // Check min stake
    const minStake = await battleInstance.minStake();
    console.log('   Min stake:', ethers.formatEther(minStake), 'ROAST\n');
    
    // ==== STEP 5: SAVE DEPLOYMENT INFO ====
    console.log('5️⃣  Saving deployment information...');
    
    const deploymentInfo = {
        network: 'Base Mainnet',
        chainId: 8453,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        contracts: {
            RoastToken: {
                address: tokenAddress,
                txHash: tokenInstance.deploymentTransaction().hash,
                explorer: `https://basescan.org/address/${tokenAddress}`
            },
            RoastBattle: {
                address: battleAddress,
                txHash: battleInstance.deploymentTransaction().hash,
                explorer: `https://basescan.org/address/${battleAddress}`
            }
        },
        verification: {
            totalSupply: ethers.formatEther(totalSupply),
            minStake: ethers.formatEther(minStake),
            tokenLinkCorrect: linkedToken === tokenAddress
        }
    };
    
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('   ✅ Saved to deployment.json\n');
    
    // ==== SUCCESS ====
    console.log('═'.repeat(70));
    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('═'.repeat(70));
    console.log('\n📍 CONTRACT ADDRESSES:\n');
    console.log(`   RoastToken:  ${tokenAddress}`);
    console.log(`   RoastBattle: ${battleAddress}\n`);
    console.log('🔗 EXPLORERS:\n');
    console.log(`   Token:  https://basescan.org/address/${tokenAddress}`);
    console.log(`   Battle: https://basescan.org/address/${battleAddress}\n`);
    console.log('🎯 NEXT STEP:\n');
    console.log(`   Run: ./update-contracts.sh ${tokenAddress} ${battleAddress}\n`);
    
    process.exit(0);
    
} catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    if (error.data) console.error('   Error data:', error.data);
    process.exit(1);
}
