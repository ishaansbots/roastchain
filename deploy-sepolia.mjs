#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const solc = require('solc');
import { ethers } from 'ethers';

const PRIVATE_KEY = '0x52c052d430f89b53b4926ea76987f56c24f73c3a84452f70adfa11e34cc91c2d';
const DEPLOYER = '0x18A00B37725558a008E23794d4001065ddDD5432';
const RPC_URL = 'https://sepolia.base.org'; // BASE SEPOLIA TESTNET
const CHAIN_ID = 84532;

console.log('🔥 ROASTCHAIN - Base Sepolia Testnet Deployment');
console.log('📍 Deployer:', DEPLOYER);
console.log('🌐 Network: Base Sepolia (testnet)');
console.log('⛓️  Chain ID:', CHAIN_ID);

// Check balance
async function checkBalance() {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [DEPLOYER, 'latest'],
      id: 1
    })
  });
  const data = await response.json();
  const balance = BigInt(data.result);
  console.log('💰 Balance:', (Number(balance) / 1e18).toFixed(10), 'ETH');
  return balance;
}

const balance = await checkBalance();

if (balance === 0n) {
  console.log('\n❌ NEED TESTNET ETH');
  console.log('🚰 Get free testnet ETH from:');
  console.log('   https://www.alchemy.com/faucets/base-sepolia');
  console.log('   OR https://docs.base.org/docs/tools/network-faucets/');
  console.log('\n📍 Send to:', DEPLOYER);
  process.exit(1);
}

console.log('✅ Wallet funded, proceeding...\n');

// Compile contracts (same as before)
console.log('1️⃣  Compiling RoastToken.sol...');

const tokenSource = readFileSync('./contracts/RoastToken.sol', 'utf8');
const battleSource = readFileSync('./contracts/RoastBattle-v2.sol', 'utf8');

function findImports(path) {
  if (path.startsWith('@openzeppelin/')) {
    try {
      const modulePath = path.replace('@openzeppelin/contracts/', '');
      const fullPath = `./node_modules/@openzeppelin/contracts/${modulePath}`;
      return { contents: readFileSync(fullPath, 'utf8') };
    } catch (e) {
      return { error: 'File not found: ' + path };
    }
  }
  return { error: 'Unknown import: ' + path };
}

const tokenInput = {
  language: 'Solidity',
  sources: { 'RoastToken.sol': { content: tokenSource } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
  }
};

const tokenCompiled = JSON.parse(solc.compile(JSON.stringify(tokenInput), { import: findImports }));

if (tokenCompiled.errors) {
  const errors = tokenCompiled.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('❌ Token compilation failed:', errors);
    process.exit(1);
  }
}

const tokenContract = tokenCompiled.contracts['RoastToken.sol']['RoastToken'];
const tokenBytecode = '0x' + tokenContract.evm.bytecode.object;
const tokenAbi = tokenContract.abi;

console.log('   ✅ Compilation successful!');
console.log('📦 Token bytecode size:', tokenBytecode.length, 'characters\n');

// Compile RoastBattle
console.log('2️⃣  Compiling RoastBattle-v2.sol...');

const battleInput = {
  language: 'Solidity',
  sources: { 'RoastBattle-v2.sol': { content: battleSource } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
  }
};

const battleCompiled = JSON.parse(solc.compile(JSON.stringify(battleInput), { import: findImports }));

if (battleCompiled.errors) {
  const errors = battleCompiled.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('❌ Battle compilation failed:', errors);
    process.exit(1);
  }
}

const battleContract = battleCompiled.contracts['RoastBattle-v2.sol']['RoastBattle'];
const battleAbi = battleContract.abi;

console.log('   ✅ Compilation successful!');
console.log('📦 Battle bytecode template ready\n');

// Deploy Token
console.log('3️⃣  Deploying RoastToken to Base Sepolia...');

async function getNonce() {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [DEPLOYER, 'pending'],
      id: 1
    })
  });
  const data = await response.json();
  return parseInt(data.result, 16);
}

async function sendTx(txData) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [txData],
      id: 1
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function waitForTx(txHash) {
  console.log('   ⏳ Tx hash:', txHash);
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1
      })
    });
    const data = await response.json();
    if (data.result) {
      if (data.result.status === '0x1') {
        return data.result.contractAddress;
      } else {
        throw new Error('Transaction failed');
      }
    }
  }
  throw new Error('Transaction timeout');
}

async function signAndSend(data, nonce, gasLimit) {
  const tx = {
    nonce: nonce,
    gasPrice: ethers.parseUnits('0.1', 'gwei'), // Lower gas price for testnet
    gasLimit: gasLimit,
    to: null,
    value: 0n,
    data: data,
    chainId: CHAIN_ID,
    type: 0
  };
  
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const signedTx = await wallet.signTransaction(tx);
  
  return await sendTx(signedTx);
}

try {
  const nonce = await getNonce();
  const tokenTxHash = await signAndSend(tokenBytecode, nonce, 800000);
  const tokenAddress = await waitForTx(tokenTxHash);
  
  console.log('   ✅ RoastToken deployed!');
  console.log('   📍 Address:', tokenAddress);
  console.log('   🔗 BaseScan:', `https://sepolia.basescan.org/address/${tokenAddress}\n`);
  
  // Deploy RoastBattle with token address
  console.log('4️⃣  Deploying RoastBattle...');
  
  const iface = new ethers.Interface(battleAbi);
  const battleBytecode = '0x' + battleContract.evm.bytecode.object + 
    iface.encodeDeploy([tokenAddress]).slice(2);
  
  const battleTxHash = await signAndSend(battleBytecode, nonce + 1, 1500000);
  const battleAddress = await waitForTx(battleTxHash);
  
  console.log('   ✅ RoastBattle deployed!');
  console.log('   📍 Address:', battleAddress);
  console.log('   🔗 BaseScan:', `https://sepolia.basescan.org/address/${battleAddress}\n`);
  
  console.log('✅ DEPLOYMENT COMPLETE!\n');
  console.log('📋 CONTRACT ADDRESSES:');
  console.log('   Token:  ', tokenAddress);
  console.log('   Battle: ', battleAddress);
  console.log('\n🔗 Network: Base Sepolia Testnet');
  console.log('   Explorer: https://sepolia.basescan.org/');
  
  // Save addresses
  const addressData = {
    network: 'base-sepolia',
    chainId: CHAIN_ID,
    token: tokenAddress,
    battle: battleAddress,
    deployer: DEPLOYER,
    deployedAt: new Date().toISOString()
  };
  
  await import('fs/promises').then(fs => 
    fs.writeFile('./deployed-addresses-sepolia.json', JSON.stringify(addressData, null, 2))
  );
  
  console.log('\n💾 Addresses saved to: deployed-addresses-sepolia.json');
  console.log('\n🚀 Next: Run ./update-contracts.sh', tokenAddress, battleAddress);
  
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}
