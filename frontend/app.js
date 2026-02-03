/**
 * ROASTCHAIN - Simple Working Wallet Connect
 */

const CHAIN_ID = 8453; // Base mainnet

let userAddress = null;

// Character counter
const roastTextarea = document.getElementById('roastText');
if (roastTextarea) {
    roastTextarea.addEventListener('input', (e) => {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = e.target.value.length;
        }
    });
}

// Simple wallet connect
document.getElementById('connectWallet')?.addEventListener('click', async () => {
    try {
        console.log('Wallet connect clicked');
        
        // Check if MetaMask exists
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask!\n\nVisit: https://metamask.io');
            window.open('https://metamask.io', '_blank');
            return;
        }
        
        console.log('MetaMask detected');
        
        // Request accounts
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        console.log('Accounts:', accounts);
        
        if (!accounts || accounts.length === 0) {
            alert('No accounts found. Please create a wallet in MetaMask.');
            return;
        }
        
        userAddress = accounts[0];
        console.log('Connected:', userAddress);
        
        // Check chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain:', chainId, 'Expected:', '0x2105');
        
        // If not on Base, try to switch
        if (chainId !== '0x2105') {
            console.log('Wrong network, switching to Base...');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x2105' }],
                });
                console.log('Switched to Base');
            } catch (switchError) {
                console.log('Switch error:', switchError);
                
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    console.log('Adding Base network...');
                    try {
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
                        console.log('Base network added');
                    } catch (addError) {
                        console.error('Add network error:', addError);
                        alert('Failed to add Base network. Please add manually:\n\nNetwork: Base\nRPC: https://mainnet.base.org\nChain ID: 8453');
                        return;
                    }
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
            createBtn.style.opacity = '1';
        }
        
        console.log('✅ Wallet connected successfully!');
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        alert('Failed to connect wallet:\n\n' + (error.message || 'Unknown error'));
    }
});

// Create battle
document.getElementById('createBattle')?.addEventListener('click', async () => {
    try {
        if (!userAddress) {
            alert('Please connect your wallet first!');
            return;
        }
        
        let twitterHandle = document.getElementById('twitterHandle')?.value || '';
        const targetWallet = document.getElementById('targetWallet')?.value || '';
        const stake = document.getElementById('stakeAmount')?.value;
        const roast = document.getElementById('roastText')?.value;
        
        // Clean Twitter handle
        twitterHandle = twitterHandle.trim();
        if (twitterHandle.startsWith('@')) {
            twitterHandle = twitterHandle.slice(1);
        }
        
        // Validation
        if (!twitterHandle) {
            alert('Please enter a Twitter handle!\n\nExample: solana or @solana');
            return;
        }
        
        if (!stake || parseFloat(stake) < 100) {
            alert('Minimum stake is 100 ROAST tokens!');
            return;
        }
        
        if (!roast || roast.length < 10) {
            alert('Your roast needs to be at least 10 characters!\n\nMake it good! 🔥');
            return;
        }
        
        if (roast.length > 500) {
            alert('Roast too long! Maximum 500 characters.');
            return;
        }
        
        // Validate target wallet if provided
        if (targetWallet && targetWallet.length > 0) {
            if (!targetWallet.startsWith('0x') || targetWallet.length !== 42) {
                alert('Invalid wallet address!\n\nShould be 42 characters starting with 0x\n\nLeave empty if you don\'t know it.');
                return;
            }
        }
        
        const button = document.getElementById('createBattle');
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Creating Battle...';
        
        // Simulate transaction (in production, would call smart contract)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`🔥 ROAST BATTLE CREATED!

Target: @${twitterHandle}
${targetWallet ? 'Wallet: ' + targetWallet : 'No wallet linked - Twitter roast only!'}
Stake: ${stake} ROAST

✅ Your roast will be tweeted soon!

If @${twitterHandle} responds on-chain:
→ AI will judge the winner
→ Winner gets the pot
→ Loser's tokens get BURNED 🔥

If no response in 24h:
→ You win by default
→ Get your stake back

Good luck! 💀`);
        
        // Clear form
        document.getElementById('twitterHandle').value = '';
        if (document.getElementById('targetWallet')) {
            document.getElementById('targetWallet').value = '';
        }
        document.getElementById('stakeAmount').value = '';
        document.getElementById('roastText').value = '';
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = '0';
        }
        
        button.disabled = false;
        button.textContent = originalText;
        
    } catch (error) {
        console.error('Battle creation error:', error);
        alert('Failed to create battle:\n\n' + error.message);
        
        const button = document.getElementById('createBattle');
        button.disabled = false;
        button.textContent = 'Create Battle & Tweet';
    }
});

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            console.log('User disconnected wallet');
            window.location.reload();
        } else {
            // User switched accounts
            console.log('Account changed to:', accounts[0]);
            userAddress = accounts[0];
            document.getElementById('walletAddress').textContent = 
                userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        }
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        window.location.reload();
    });
}

// Debug info
console.log('RoastChain loaded');
console.log('MetaMask available:', typeof window.ethereum !== 'undefined');
console.log('Expected chain ID:', CHAIN_ID, '(0x2105)');
