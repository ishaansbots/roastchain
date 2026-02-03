/**
 * ROASTCHAIN - Fixed Business Logic
 * Twitter-first roasting with optional on-chain responses
 */

const CHAIN_ID = 8453; // Base mainnet
const CONTRACT_ADDRESS = "TBD"; // Update after deployment
const TOKEN_ADDRESS = "TBD"; // Update after deployment

let provider;
let signer;
let userAddress;

// Character counter
document.getElementById('roastText')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('charCount').textContent = count;
});

// Wallet connection
document.getElementById('connectWallet')?.addEventListener('click', async () => {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask! Visit https://metamask.io');
            return;
        }
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        // Check network
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x2105' }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base',
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org']
                        }]
                    });
                } else {
                    throw switchError;
                }
            }
        }
        
        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        const walletInfo = document.getElementById('walletInfo');
        walletInfo.style.display = 'block';
        document.getElementById('walletAddress').textContent = 
            userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        
        // Enable battle button
        const createBtn = document.getElementById('createBattle');
        if (createBtn) {
            createBtn.disabled = false;
        }
        
        console.log('✅ Wallet connected:', userAddress);
        
    } catch (error) {
        console.error('Connection error:', error);
        alert('Failed to connect: ' + (error.message || 'Unknown error'));
    }
});

// Create battle with Twitter handle
document.getElementById('createBattle')?.addEventListener('click', async () => {
    try {
        let twitterHandle = document.getElementById('twitterHandle')?.value || '';
        const targetWallet = document.getElementById('targetWallet')?.value || '';
        const stake = document.getElementById('stakeAmount')?.value;
        const roast = document.getElementById('roastText')?.value;
        
        // Clean up Twitter handle
        twitterHandle = twitterHandle.trim();
        if (twitterHandle.startsWith('@')) {
            twitterHandle = twitterHandle.slice(1);
        }
        
        // Validation
        if (!twitterHandle) {
            alert('Please enter a Twitter handle!');
            return;
        }
        
        if (!stake || stake < 100) {
            alert('Minimum stake is 100 ROAST!');
            return;
        }
        
        if (!roast || roast.length < 10) {
            alert('Your roast needs to be at least 10 characters!');
            return;
        }
        
        if (!userAddress) {
            alert('Please connect wallet first!');
            return;
        }
        
        // Validate target wallet if provided
        if (targetWallet && !ethers.isAddress(targetWallet)) {
            alert('Invalid wallet address! Leave empty if you don\'t know it.');
            return;
        }
        
        const button = document.getElementById('createBattle');
        button.disabled = true;
        button.textContent = 'Creating Battle...';
        
        // In production, this would:
        // 1. Call smart contract to create battle
        // 2. Store Twitter handle mapping
        // 3. Trigger tweet via backend
        
        // For now, simulate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`🔥 Battle Created!

Target: @${twitterHandle}
${targetWallet ? 'Wallet: ' + targetWallet : 'No wallet linked - Twitter roast only!'}
Stake: ${stake} ROAST

Your roast will be tweeted soon!

If they respond on-chain, AI will judge the winner.
If no response in 24h, you win by default! 💀`);
        
        // Clear form
        document.getElementById('twitterHandle').value = '';
        document.getElementById('targetWallet').value = '';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('roastText').value = '';
        document.getElementById('charCount').textContent = '0';
        
        button.disabled = false;
        button.textContent = 'Create Battle & Tweet';
        
    } catch (error) {
        console.error('Battle creation error:', error);
        alert('Failed: ' + error.message);
        const button = document.getElementById('createBattle');
        button.disabled = false;
        button.textContent = 'Create Battle & Tweet';
    }
});

// Handle account/network changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', () => window.location.reload());
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            window.location.reload();
        } else {
            userAddress = accounts[0];
            window.location.reload();
        }
    });
}
