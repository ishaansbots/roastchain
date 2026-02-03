/**
 * Simple wallet connection for Rainbow and other Web3 wallets
 */

const CHAIN_ID = 84532; // Base Sepolia
const CHAIN_ID_HEX = '0x14a34';

let userAddress = null;

async function connectWallet() {
    try {
        if (!window.ethereum) {
            alert('Please install Rainbow wallet or MetaMask');
            return;
        }

        // Simple account request - no blocking
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts');
        }
        
        userAddress = accounts[0];
        
        // Update UI
        document.getElementById('connectButton').textContent = 
            userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        document.getElementById('connectButton').style.background = 
            'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        // Network switch - non-blocking
        checkNetwork();
        
        return userAddress;
        
    } catch (error) {
        console.error('Connection error:', error);
        alert('Failed to connect: ' + error.message);
    }
}

async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== CHAIN_ID_HEX) {
            // Ask to switch - don't block
            const shouldSwitch = confirm(
                'Switch to Base Sepolia testnet?\n\n' +
                '(Required to use RoastChain)'
            );
            
            if (shouldSwitch) {
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
                                chainName: 'Base Sepolia',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.base.org'],
                                blockExplorerUrls: ['https://sepolia.basescan.org']
                            }]
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Network check error:', error);
    }
}

// Export for use
window.connectWallet = connectWallet;
window.userAddress = () => userAddress;
