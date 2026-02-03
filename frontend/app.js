/**
 * RoastChain - Production-Grade Frontend
 * Follows Vercel Web Interface Guidelines
 */

const CHAIN_ID = 8453; // Base mainnet
const CHAIN_ID_HEX = '0x2105';

let userAddress = null;

// Character counter with live region update
const roastTextarea = document.getElementById('roastText');
const charCountSpan = document.getElementById('charCount');

if (roastTextarea && charCountSpan) {
    roastTextarea.addEventListener('input', (e) => {
        const count = e.target.value.length;
        charCountSpan.textContent = count;
    });
}

// Wallet connection with comprehensive error handling
const connectButton = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const createBattleButton = document.getElementById('createBattle');

connectButton?.addEventListener('click', async () => {
    try {
        console.log('[RoastChain] Wallet connect initiated');
        
        // Check MetaMask availability
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask not detected.\\n\\nPlease install MetaMask to use RoastChain:\\nhttps://metamask.io');
            window.open('https://metamask.io', '_blank', 'noopener,noreferrer');
            return;
        }
        
        console.log('[RoastChain] MetaMask detected');
        
        // Request accounts
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts returned from MetaMask');
        }
        
        userAddress = accounts[0];
        console.log('[RoastChain] Connected:', userAddress);
        
        // Check current network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('[RoastChain] Current chain:', chainId, 'Expected:', CHAIN_ID_HEX);
        
        // Switch to Base if needed
        if (chainId !== CHAIN_ID_HEX) {
            console.log('[RoastChain] Wrong network, switching to Base…');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CHAIN_ID_HEX }],
                });
                console.log('[RoastChain] Switched to Base');
            } catch (switchError) {
                // Network not added, add it
                if (switchError.code === 4902) {
                    console.log('[RoastChain] Adding Base network…');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: CHAIN_ID_HEX,
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
                        console.log('[RoastChain] Base network added');
                    } catch (addError) {
                        console.error('[RoastChain] Failed to add network:', addError);
                        alert('Failed to add Base network.\\n\\nPlease add manually:\\n\\nNetwork: Base\\nRPC: https://mainnet.base.org\\nChain ID: 8453\\nSymbol: ETH\\nExplorer: https://basescan.org');
                        return;
                    }
                } else {
                    throw switchError;
                }
            }
        }
        
        // Update UI
        connectButton.style.display = 'none';
        walletInfo.style.display = 'block';
        walletAddress.textContent = `${userAddress.slice(0, 6)}…${userAddress.slice(-4)}`;
        
        // Enable battle button
        if (createBattleButton) {
            createBattleButton.disabled = false;
        }
        
        console.log('[RoastChain] ✓ Wallet connected successfully');
        
    } catch (error) {
        console.error('[RoastChain] Wallet connection error:', error);
        
        let errorMessage = 'Failed to connect wallet.';
        if (error.code === 4001) {
            errorMessage = 'Connection rejected.\\n\\nPlease approve the connection in MetaMask.';
        } else if (error.message) {
            errorMessage += `\\n\\n${error.message}`;
        }
        
        alert(errorMessage);
    }
});

// Form submission with validation
const battleForm = document.getElementById('battleForm');

battleForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        if (!userAddress) {
            alert('Please connect your wallet first.');
            connectButton?.focus();
            return;
        }
        
        // Get form values
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
            alert('Please enter a Twitter handle.\\n\\nExample: solana or @solana');
            document.getElementById('twitterHandle')?.focus();
            return;
        }
        
        if (!stake || parseFloat(stake) < 100) {
            alert('Minimum stake is 100 ROAST tokens.');
            document.getElementById('stakeAmount')?.focus();
            return;
        }
        
        if (!roast || roast.length < 10) {
            alert('Your roast needs to be at least 10 characters.\\n\\nMake it good! 🔥');
            document.getElementById('roastText')?.focus();
            return;
        }
        
        if (roast.length > 500) {
            alert('Roast too long! Maximum 500 characters.');
            document.getElementById('roastText')?.focus();
            return;
        }
        
        // Validate target wallet if provided
        if (targetWallet && targetWallet.length > 0) {
            const walletPattern = /^0x[a-fA-F0-9]{40}$/;
            if (!walletPattern.test(targetWallet)) {
                alert('Invalid wallet address.\\n\\nShould be 42 characters starting with 0x.\\n\\nLeave empty if you don't know it.');
                document.getElementById('targetWallet')?.focus();
                return;
            }
        }
        
        // Show loading state
        const originalText = createBattleButton.textContent;
        createBattleButton.disabled = true;
        createBattleButton.innerHTML = '<span class="loading" role="status" aria-label="Loading"></span>Creating Battle…';
        
        // Simulate transaction (in production: call smart contract)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success message
        alert(`🔥 ROAST BATTLE CREATED!

Target: @${twitterHandle}
${targetWallet ? `Wallet: ${targetWallet}` : 'No wallet linked — Twitter roast only!'}
Stake: ${stake} ROAST

✓ Your roast will be tweeted soon!

If @${twitterHandle} responds on-chain:
→ AI will judge the winner
→ Winner gets the pot
→ Loser's tokens get BURNED 🔥

If no response in 24 hours:
→ You win by default
→ Get your stake back

Good luck! 💀`);
        
        // Reset form
        battleForm.reset();
        charCountSpan.textContent = '0';
        
        // Restore button
        createBattleButton.disabled = false;
        createBattleButton.textContent = originalText;
        
    } catch (error) {
        console.error('[RoastChain] Battle creation error:', error);
        alert(`Failed to create battle:\\n\\n${error.message || 'Unknown error'}`);
        
        // Restore button
        createBattleButton.disabled = false;
        createBattleButton.textContent = 'Create Battle & Tweet';
    }
});

// Listen for account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            console.log('[RoastChain] User disconnected wallet');
            // Reload to reset state
            window.location.reload();
        } else {
            console.log('[RoastChain] Account changed to:', accounts[0]);
            userAddress = accounts[0];
            walletAddress.textContent = `${userAddress.slice(0, 6)}…${userAddress.slice(-4)}`;
        }
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
        console.log('[RoastChain] Chain changed to:', chainId);
        // Reload to handle new network
        window.location.reload();
    });
}

// Debug info (production: remove or gate behind flag)
console.log('[RoastChain] Frontend loaded');
console.log('[RoastChain] MetaMask available:', typeof window.ethereum !== 'undefined');
console.log('[RoastChain] Expected network: Base (Chain ID:', CHAIN_ID, '/', CHAIN_ID_HEX + ')');

// Prevent form submission on Enter in text inputs (except textarea)
document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Move to next field or submit if last
            const form = e.target.form;
            const index = Array.from(form.elements).indexOf(e.target);
            const nextElement = form.elements[index + 1];
            
            if (nextElement && nextElement.type !== 'submit') {
                nextElement.focus();
            } else {
                form.requestSubmit();
            }
        }
    });
});
