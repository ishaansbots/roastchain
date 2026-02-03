#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const solc = require('solc');
import { ethers } from 'ethers';

const PRIVATE_KEY = '0x52c052d430f89b53b4926ea76987f56c24f73c3a84452f70adfa11e34cc91c2d';
const DEPLOYER = '0x18A00B37725558a008E23794d4001065ddDD5432';
const RPC_URL = 'https://sepolia.base.org';
const CHAIN_ID = 84532;
const TOKEN_ADDRESS = '0x75edb1f40a6f8b519453989dc426eb236663109f';

console.log('🔥 Deploying RoastBattle only...');
console.log('🪙 Token:', TOKEN_ADDRESS);

// Check balance
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
console.log('💰 Balance:', (Number(balance) / 1e18).toFixed(8), 'ETH\n');

// Compile
console.log('Compiling RoastBattle-v2.sol...');
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

const battleInput = {
  language: 'Solidity',
  sources: { 'RoastBattle-v2.sol': { content: battleSource } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } }
  }
};

const battleCompiled = JSON.parse(solc.compile(JSON.stringify(battleInput), { import: findImports }));
const battleContract = battleCompiled.contracts['RoastBattle-v2.sol']['RoastBattle'];
const battleAbi = battleContract.abi;

const iface = new ethers.Interface(battleAbi);
const battleBytecode = '0x' + battleContract.evm.bytecode.object + 
  iface.encodeDeploy([TOKEN_ADDRESS]).slice(2);

console.log('Bytecode size:', battleBytecode.length, 'chars');

// Deploy with minimal gas
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
  console.log('⏳ Tx:', txHash);
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

try {
  const nonce = await getNonce();
  console.log('Nonce:', nonce);
  
  // Need even more gas - contract is complex
  const gasLimit = 4000000; // High limit for complex contract
  const gasPrice = ethers.parseUnits('1', 'gwei'); // Normal gas price
  
  console.log('Gas limit:', gasLimit);
  console.log('Gas price: 0.1 gwei');
  console.log('Max cost:', (gasLimit * Number(gasPrice) / 1e18).toFixed(8), 'ETH\n');
  
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const tx = {
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    to: null,
    value: 0n,
    data: battleBytecode,
    chainId: CHAIN_ID,
    type: 0
  };
  
  const signedTx = await wallet.signTransaction(tx);
  const txHash = await sendTx(signedTx);
  const battleAddress = await waitForTx(txHash);
  
  console.log('\n✅ RoastBattle deployed!');
  console.log('📍 Address:', battleAddress);
  console.log('🔗 BaseScan: https://sepolia.basescan.org/address/' + battleAddress);
  
  console.log('\n📋 BOTH CONTRACTS:');
  console.log('Token: ', TOKEN_ADDRESS);
  console.log('Battle:', battleAddress);
  
} catch (error) {
  console.error('\n❌ Failed:', error.message);
  process.exit(1);
}
