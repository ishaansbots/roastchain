/**
 * RoastChain - Production Frontend
 * Contract addresses updated: Wed Feb  4 03:55:30 IST 2026
 */

const TOKEN_ADDRESS = "0x75edb1f40a6f8b519453989dc426eb236663109f";
const BATTLE_ADDRESS = "0xb9f68aa4f86a34db6e910cfddf6f3baa21b88d35";
const CHAIN_ID = 8453; // Base mainnet
const CHAIN_ID_HEX = '0x2105';

let userAddress = null;

// Wallet connection
const connectButton = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const createBattleButton = document.getElementById('createBattle');

connectButton?.addEventListener('click', async () => {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask not detected. Please install MetaMask to use RoastChain.');
            window.open('https://metamask.io', '_blank');
            return;
        }
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts returned');
        }
        
        userAddress = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== CHAIN_ID_HEX) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CHAIN_ID_HEX }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: CHAIN_ID_HEX,
                            chainName: 'Base',
                            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org']
                        }]
                    });
                } else {
                    throw switchError;
                }
            }
        }
        
        connectButton.style.display = 'none';
        walletInfo.style.display = 'block';
        walletAddress.textContent = `${userAddress.slice(0, 6)}…${userAddress.slice(-4)}`;
        if (createBattleButton) createBattleButton.disabled = false;
        
    } catch (error) {
        console.error('Connection error:', error);
        alert('Failed to connect: ' + error.message);
    }
});

// Form submission
const battleForm = document.getElementById('battleForm');
battleForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!userAddress) {
        alert('Please connect your wallet first.');
        return;
    }
    
    let twitterHandle = document.getElementById('twitterHandle')?.value || '';
    const targetWallet = document.getElementById('targetWallet')?.value || '';
    const stake = document.getElementById('stakeAmount')?.value;
    const roast = document.getElementById('roastText')?.value;
    
    twitterHandle = twitterHandle.trim().replace('@', '');
    
    if (!twitterHandle || !stake || parseFloat(stake) < 100 || !roast || roast.length < 10 || roast.length > 500) {
        alert('Please fill all fields correctly.');
        return;
    }
    
    try {
        const originalText = createBattleButton.textContent;
        createBattleButton.disabled = true;
        createBattleButton.textContent = 'Creating Battle…';
        
        // In production: call smart contract here
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`🔥 ROAST BATTLE CREATED!

Target: @${twitterHandle}
Stake: ${stake} ROAST

Your roast will be tweeted soon! 🔥`);
        
        battleForm.reset();
        createBattleButton.disabled = false;
        createBattleButton.textContent = originalText;
        
    } catch (error) {
        console.error('Battle creation error:', error);
        alert('Failed to create battle: ' + error.message);
        createBattleButton.disabled = false;
        createBattleButton.textContent = 'Create Battle & Tweet';
    }
});

// Account/network change listeners
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            window.location.reload();
        } else {
            userAddress = accounts[0];
            walletAddress.textContent = `${userAddress.slice(0, 6)}…${userAddress.slice(-4)}`;
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

console.log('RoastChain loaded');
console.log('Token:', TOKEN_ADDRESS);
console.log('Battle:', BATTLE_ADDRESS);
console.log('Network: Base (8453)');
