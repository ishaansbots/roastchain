# 🔥 ROASTCHAIN - Business Logic (Fixed)

## The Problem We Solved

**Original (Broken) Idea**: Target people by wallet address  
**Why It's Broken**: Nobody knows wallet addresses. Roasting is SOCIAL, not just crypto.

**New (Fixed) Idea**: Target people by **Twitter handle**, crypto is optional  
**Why It Works**: Everyone knows @handles. Roasting goes viral on Twitter!

---

## How It Actually Works

### 1️⃣ Creating a Roast

**You need**:
- Target's Twitter handle (like `@solana` or `@elonmusk`)
- Your roast (max 500 chars)
- $ROAST tokens to stake (min 100)
- Optional: Target's wallet (if you know it)

**What happens**:
1. You fill in form on frontend
2. Smart contract creates battle
3. Your roast gets **tweeted** from @kalesh_bot tagging the target
4. Target sees it on Twitter (even if they don't have crypto!)

### 2️⃣ Target Response (Optional)

**If target has crypto**:
- They can link their wallet to their Twitter handle
- Respond with counter-roast on-chain
- Stake matching or higher amount
- Now it's a REAL battle

**If target has no crypto**:
- They just see the roast on Twitter
- Can't respond on-chain
- You auto-win after 24h (get stake back)
- But roast still goes viral!

### 3️⃣ AI Judging

**For on-chain battles**:
- AI judge (Claude) evaluates both roasts
- Criteria: Creativity, Wit, Relevance, Savagery
- Winner gets 95% of pot (5% platform fee)
- **Loser's tokens get BURNED** 🔥

**For Twitter-only roasts**:
- No on-chain battle = no judging
- Just public entertainment
- You get stake back after 24h

---

## Smart Contract Flow

### Data Structure

```solidity
struct Battle {
    uint256 id;
    address challenger;
    string targetTwitter;        // @handle (without @)
    address targetWallet;        // 0x0 if unknown
    uint256 pot;
    string challengerRoast;
    string defenderRoast;
    address winner;
    bool resolved;
    bool tweetedOut;
    uint256 createdAt;
}

// Mappings for Twitter <-> Wallet linking
mapping(string => address) public twitterToWallet;
mapping(address => string) public walletToTwitter;
```

### Key Functions

**linkTwitter(string handle)**
- Links your wallet to your Twitter handle
- Lets you respond to roasts targeting your @handle
- Can update anytime

**createBattle(string targetTwitter, address targetWallet, string roast, uint256 stake)**
- Creates new roast battle
- `targetWallet` can be 0x0 (we'll check if they linked)
- Automatically checks `twitterToWallet` mapping
- Transfers stake to contract

**respondToBattle(uint256 battleId, string roast, uint256 stake)**
- Only callable by target (verified by wallet OR Twitter link)
- Must match or exceed original stake
- Battle becomes "active" for judging

**resolveBattle(uint256 battleId, uint8 winnerId)**
- Called by AI judge (owner)
- Winner = 1 (challenger) or 2 (defender)
- Distributes pot to winner
- Loser's stake stays in contract (burned)

**forfeit(uint256 battleId)**
- Anyone can call after 24h if no response
- Challenger gets stake back (minus fee)
- Battle marked resolved

---

## User Flows

### Flow 1: Roasting Someone Famous (No Crypto)

1. Alice wants to roast @solana
2. Alice fills in: `@solana`, her roast, 100 ROAST stake
3. Battle created, roast tweeted
4. @solana sees tweet, laughs, ignores
5. 24h pass, Alice calls `forfeit()`, gets stake back
6. **Result**: Public entertainment, no on-chain battle

### Flow 2: Roasting a Crypto Person (With Response)

1. Bob wants to roast @vitalik
2. Bob fills in: `@vitalik`, roast, 500 ROAST stake
3. Battle created, roast tweeted
4. Vitalik (who linked his wallet) sees it
5. Vitalik responds on-chain with counter-roast, stakes 500 ROAST
6. AI judge evaluates both roasts
7. Vitalik wins (obviously, he's Vitalik)
8. Vitalik gets 950 ROAST (95% of 1000), Bob's 500 BURNED
9. **Result**: Real battle, winner paid, loser rekt

### Flow 3: Pre-emptive Linking

1. Carol knows she might get roasted
2. Carol calls `linkTwitter("carol_crypto")`
3. Now when someone roasts @carol_crypto, she gets notified
4. She can respond on-chain anytime

---

## Token Buy Flow (Once Deployed)

**Currently**: Token deploying (bytecode issue being fixed)

**When ready**:
1. Get ETH on Base via [bridge.base.org](https://bridge.base.org)
2. Go to [app.uniswap.org](https://app.uniswap.org), switch to Base
3. Buy $ROAST with exact contract address (will be announced)
4. Or wait for airdrop/launch event

**Why we need specific address**:
- Many fake "ROAST" tokens exist
- Only OUR contract address works with battles
- Frontend will show exact address when deployed

---

## Why This Business Logic Works

✅ **Social-First**: Uses Twitter handles everyone knows  
✅ **Crypto-Optional**: Target doesn't need wallet to be roasted  
✅ **Viral Potential**: Every battle is a tweet = free marketing  
✅ **Real Stakes**: On-chain battles have $ at risk  
✅ **Burn Mechanism**: Losers get rekt, token becomes scarce  
✅ **Clear Winner**: AI judge is impartial and entertaining  

---

## Technical Implementation

**Frontend**: Twitter handle input + optional wallet  
**Smart Contract**: Maps Twitter ↔ Wallet, allows both paths  
**Backend Bot**: Tweets roasts, monitors responses  
**AI Judge**: Evaluates roasts via Claude API  

**Stack**:
- Frontend: Vanilla JS + Ethers.js (Base network)
- Contracts: Solidity + OpenZeppelin (ReentrancyGuard, Ownable)
- Bot: Node.js + Twitter API (bird CLI)
- Judge: Claude 4 Sonnet via Anthropic API

---

## Security Considerations

**Smart Contract**:
- ReentrancyGuard prevents reentrancy attacks
- Ownable limits admin functions (only owner can judge/mark tweeted)
- Input validation on all strings
- SafeMath patterns (Solidity 0.8.20)

**Twitter Linking**:
- Users sign message with wallet
- Tweet signature to prove ownership
- Contract verifies signature before linking

**AI Judge**:
- Only callable by owner (centralized for MVP)
- Future: DAO governance or multiple judges
- Transparent: all roasts stored on-chain

---

## Future Enhancements

**Phase 2**:
- Multi-judge voting (DAO)
- Celebrity verification
- Sponsored battles
- Leaderboards
- NFT roast collectibles

**Phase 3**:
- Mobile app
- Video roasts
- Live roast events
- Cross-chain battles

---

**Built for #ClawdKitchen by @kalesh_bot** 🦀
