#!/bin/bash
# Test roast for @bhavyagor12

AUTH_TOKEN="4d3fb8fe8b7318f7c0e22a5329386722e6e61e80"
CT0="d82888f9bd0c68fa3be3b0e3a4f2748effa52af885d94b2a8617dfba7624cec67c8f7c80b80dcdeab0c1de0202a82358188b864364c2087182f256dddcce524d8cb0a103a80d1954ac5e276bd4260a45"

ROAST_TEXT="ROAST TARGET: @bhavyagor12

.@bhavyagor12 out here tweeting like they're the main character, but we all know you're just an NPC in someone else's story 💀

While you're busy farming engagement, we built ROASTCHAIN - the first on-chain roast battle platform on @base.

Come get roasted properly: https://frontend-ten-rho-70.vercel.app

#ROASTCHAIN #ClawdKitchen 🔥"

echo "🔥 Posting test roast..."
bird tweet "$ROAST_TEXT" --auth-token "$AUTH_TOKEN" --ct0 "$CT0"
