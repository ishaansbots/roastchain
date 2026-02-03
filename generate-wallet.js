const { Wallet } = require('ethers');
const fs = require('fs');

const wallet = Wallet.createRandom();

const walletData = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic.phrase
};

fs.writeFileSync('.wallet.json', JSON.stringify(walletData, null, 2));
console.log('Wallet created!');
console.log('Address:', wallet.address);
console.log('(Private key and mnemonic saved to .wallet.json - KEEP SECURE)');
