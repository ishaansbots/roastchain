#!/bin/bash
# ROASTCHAIN Twitter Roasting System
# Roasts someone ONLY if 4 hours have passed since last roast

set -e

CONFIG_FILE="/home/ubuntu/.openclaw/workspace/roastchain/twitter-roaster.json"
CREDENTIALS=$(cat "$CONFIG_FILE")

AUTH_TOKEN=$(echo "$CREDENTIALS" | jq -r '.twitter_credentials.auth_token')
CT0=$(echo "$CREDENTIALS" | jq -r '.twitter_credentials.ct0')
LAST_ROAST=$(echo "$CREDENTIALS" | jq -r '.last_roast')
INTERVAL_HOURS=$(echo "$CREDENTIALS" | jq -r '.roast_interval_hours')

# Check if enough time has passed
CURRENT_TIME=$(date +%s)

if [ "$LAST_ROAST" != "null" ]; then
    TIME_DIFF=$(( (CURRENT_TIME - LAST_ROAST) / 3600 ))
    
    if [ "$TIME_DIFF" -lt "$INTERVAL_HOURS" ]; then
        HOURS_LEFT=$(( INTERVAL_HOURS - TIME_DIFF ))
        echo "❌ Too soon! Wait $HOURS_LEFT more hours before next roast."
        echo "Last roast: $(date -d "@$LAST_ROAST" '+%Y-%m-%d %H:%M:%S')"
        exit 1
    fi
fi

# Get target from argument or pick random
if [ -z "$1" ]; then
    TARGET=$(echo "$CREDENTIALS" | jq -r '.targets[]' | shuf -n 1)
else
    TARGET="$1"
fi

echo "🔥 Roasting $TARGET..."

# Research the target (get recent tweets)
echo "📖 Researching $TARGET..."
TWEETS=$(bird user-tweets "$TARGET" -n 5 --auth-token "$AUTH_TOKEN" --ct0 "$CT0" --json 2>/dev/null || echo "[]")

# Generate roast (you can enhance this with AI)
ROAST_TEXT="ROAST TARGET: $TARGET

$TARGET's blockchain is like their promises - always congested and never delivering on time. 

While you're stuck with 2-hour confirmations, we're building ROASTCHAIN on @base - where transactions actually work.

Try our on-chain roast battles: https://frontend-ten-rho-70.vercel.app

#ROASTCHAIN #ClawdKitchen 🔥"

# Tweet the roast
echo "📢 Posting roast..."
bird tweet "$ROAST_TEXT" --auth-token "$AUTH_TOKEN" --ct0 "$CT0"

# Update last roast time
jq ".last_roast = $CURRENT_TIME | .roast_history += [{\"target\": \"$TARGET\", \"time\": $CURRENT_TIME}]" "$CONFIG_FILE" > "${CONFIG_FILE}.tmp"
mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"

echo "✅ Roast posted! Next roast allowed in $INTERVAL_HOURS hours."
echo "Next roast time: $(date -d "@$((CURRENT_TIME + INTERVAL_HOURS * 3600))" '+%Y-%m-%d %H:%M:%S')"
