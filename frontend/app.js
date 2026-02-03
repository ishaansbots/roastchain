// ROASTCHAIN Frontend

const CHAIN_ID = 8453; // Base mainnet
const CONTRACT_ADDRESS = "TBD"; // Will be updated after deployment
const TOKEN_ADDRESS = "TBD"; // Will be updated after Bankr response

let provider;
let signer;
let contract;
let tokenContract;
let userAddress;

// Contract ABIs (simplified for MVP)
const BATTLE_ABI = [
    "function createBattle(address target, string memory roast, uint256 stake) external",
    "function respondToBattle(uint256 battleId, string memory roast, uint256 stake) external",
    "function getBattle(uint256 battleId) external view returns (tuple(uint256 id, address challenger, address defender, uint256 pot, string challengerRoast, string defenderRoast, address winner, bool resolved, uint256 createdAt))",
    "function battleCount() external view returns (uint256)",
    "function resolveBattle(uint256 battleId, uint8 winnerId) external",
    "function forfeit(uint256 battleId) external"
];

const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)"
];

// Connect wallet
document.getElementById('connectWallet').addEventListener('click', async () => {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask or another Web3 wallet!');
            return;
        }
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        
        // Check if on correct network
        const network = await provider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + CHAIN_ID.toString(16) }],
                });
            } catch (error) {
                if (error.code === 4902) {
                    // Chain not added, add it
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x' + CHAIN_ID.toString(16),
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
                    throw error;
                }
            }
        }
        
        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('walletAddress').textContent = 
            userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        
        // Enable battle creation
        document.getElementById('createBattle').disabled = false;
        
        // Initialize contracts (when addresses are available)
        if (CONTRACT_ADDRESS !== "TBD") {
            initContracts();
            loadBattles();
        }
        
    } catch (error) {
        console.error('Connection error:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
});

// Initialize contracts
function initContracts() {
    contract = new ethers.Contract(CONTRACT_ADDRESS, BATTLE_ABI, signer);
    tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
}

// Create battle
document.getElementById('createBattle').addEventListener('click', async () => {
    try {
        const target = document.getElementById('targetAddress').value;
        const stake = document.getElementById('stakeAmount').value;
        const roast = document.getElementById('roastText').value;
        
        if (!target || !stake || !roast) {
            alert('Please fill in all fields!');
            return;
        }
        
        if (!ethers.isAddress(target)) {
            alert('Invalid target address!');
            return;
        }
        
        if (target.toLowerCase() === userAddress.toLowerCase()) {
            alert('You cannot roast yourself!');
            return;
        }
        
        if (roast.length > 500) {
            alert('Roast too long! Max 500 characters.');
            return;
        }
        
        const button = document.getElementById('createBattle');
        button.disabled = true;
        button.textContent = 'Creating Battle...';
        
        // Approve tokens first
        const stakeAmount = ethers.parseEther(stake);
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, stakeAmount);
        await approveTx.wait();
        
        // Create battle
        const tx = await contract.createBattle(target, roast, stakeAmount);
        await tx.wait();
        
        alert('Battle created! 🔥');
        
        // Clear form
        document.getElementById('targetAddress').value = '';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('roastText').value = '';
        
        // Reload battles
        loadBattles();
        
    } catch (error) {
        console.error('Create battle error:', error);
        alert('Failed to create battle: ' + error.message);
    } finally {
        const button = document.getElementById('createBattle');
        button.disabled = false;
        button.textContent = 'Create Battle';
    }
});

// Load battles
async function loadBattles() {
    try {
        if (CONTRACT_ADDRESS === "TBD") {
            return; // Contract not deployed yet
        }
        
        const count = await contract.battleCount();
        const battlesList = document.getElementById('battlesList');
        battlesList.innerHTML = '';
        
        if (count == 0) {
            battlesList.innerHTML = `
                <div class="coming-soon">
                    <h3>No battles yet!</h3>
                    <p style="margin-top: 10px; color: #aaa;">
                        Be the first to create a roast battle 🔥
                    </p>
                </div>
            `;
            return;
        }
        
        // Load recent battles (last 10)
        const startIdx = Math.max(1, count - 9);
        for (let i = count; i >= startIdx; i--) {
            const battle = await contract.getBattle(i);
            renderBattle(battle);
        }
        
        // Update stats
        updateStats();
        
    } catch (error) {
        console.error('Load battles error:', error);
    }
}

// Render battle card
function renderBattle(battle) {
    const battlesList = document.getElementById('battlesList');
    
    const card = document.createElement('div');
    card.className = 'battle-card';
    
    const statusClass = battle.resolved ? 'status-resolved' : 'status-active';
    const statusText = battle.resolved ? 'RESOLVED' : 'ACTIVE';
    
    const pot = ethers.formatEther(battle.pot);
    
    card.innerHTML = `
        <div class="battle-header">
            <span class="battle-id">Battle #${battle.id}</span>
            <span class="battle-status ${statusClass}">${statusText}</span>
        </div>
        <div class="battle-pot">💰 ${pot} $ROAST</div>
        <div class="participants">
            <div class="participant ${battle.winner === battle.challenger ? 'winner' : ''}">
                <div class="participant-label">🔥 CHALLENGER</div>
                <div class="participant-address">${battle.challenger.slice(0, 6)}...${battle.challenger.slice(-4)}</div>
                <div class="roast-text">${battle.challengerRoast || 'No roast yet'}</div>
            </div>
            <div class="participant ${battle.winner === battle.defender ? 'winner' : ''}">
                <div class="participant-label">🛡️ DEFENDER</div>
                <div class="participant-address">${battle.defender.slice(0, 6)}...${battle.defender.slice(-4)}</div>
                <div class="roast-text">${battle.defenderRoast || 'Awaiting response...'}</div>
            </div>
        </div>
        ${battle.resolved ? `
            <div style="text-align: center; margin-top: 15px; font-size: 1.2rem; color: #4caf50;">
                🏆 Winner: ${battle.winner.slice(0, 6)}...${battle.winner.slice(-4)}
            </div>
        ` : ''}
    `;
    
    battlesList.appendChild(card);
}

// Update stats
async function updateStats() {
    try {
        if (CONTRACT_ADDRESS === "TBD") return;
        
        const count = await contract.battleCount();
        document.getElementById('totalBattles').textContent = count.toString();
        
        // Calculate active battles
        let active = 0;
        for (let i = 1; i <= count; i++) {
            const battle = await contract.getBattle(i);
            if (!battle.resolved) active++;
        }
        document.getElementById('activeBattles').textContent = active;
        
    } catch (error) {
        console.error('Update stats error:', error);
    }
}

// Listen for network changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
    
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            window.location.reload();
        } else {
            userAddress = accounts[0];
            window.location.reload();
        }
    });
}

// Auto-refresh battles every 30 seconds
setInterval(() => {
    if (contract) {
        loadBattles();
    }
}, 30000);
