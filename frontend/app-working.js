/**
 * ROASTCHAIN - Working Web3 Integration
 * Fixed wallet connection + business logic
 */

// Mock contract addresses (update when deployed)
const CHAIN_ID = 8453; // Base mainnet
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deploy
const TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deploy

let provider;
let signer;
let userAddress;

// Wallet connection with proper error handling
document.getElementById('connectWallet')?.addEventListener('click', async () => {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask! Visit https://metamask.io');
            return;
        }
        
        // Request accounts
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        // Initialize provider
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        // Check network
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + CHAIN_ID.toString(16) }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105', // Base = 8453 = 0x2105
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

// Create battle function (mock until contracts deployed)
document.getElementById('createBattle')?.addEventListener('click', async () => {
    try {
        const target = document.getElementById('targetAddress')?.value;
        const stake = document.getElementById('stakeAmount')?.value;
        const roast = document.getElementById('roastText')?.value;
        
        // Validation
        if (!target || !stake || !roast) {
            alert('Please fill all fields!');
            return;
        }
        
        if (!ethers.isAddress(target)) {
            alert('Invalid address!');
            return;
        }
        
        if (!userAddress) {
            alert('Please connect wallet first!');
            return;
        }
        
        // Mock battle creation (until contracts deployed)
        const button = document.getElementById('createBattle');
        button.disabled = true;
        button.textContent = 'Creating Battle...';
        
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert('🔥 Battle created! (Mock mode - contracts deploying soon)');
        
        // Clear form
        document.getElementById('targetAddress').value = '';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('roastText').value = '';
        
        button.disabled = false;
        button.textContent = 'Create Battle';
        
    } catch (error) {
        console.error('Battle creation error:', error);
        alert('Failed: ' + error.message);
        document.getElementById('createBattle').disabled = false;
        document.getElementById('createBattle').textContent = 'Create Battle';
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

// Update stats (mock data for now)
document.getElementById('totalBattles').textContent = '0';
document.getElementById('totalBurned').textContent = '0';
document.getElementById('activeBattles').textContent = '0';
