#!/bin/bash

# WSL Side Setup for Android + Expo Mobile Development

# 1. Start socat bridge if not running
echo "Starting socat to bridge ADB..."
if pgrep socat > /dev/null
then
    echo "Socat already running."
else
    nohup socat TCP-LISTEN:5037,fork TCP:127.0.0.1:5037 > /dev/null 2>&1 &
    echo "Socat started."
fi

# 2. Start Expo in a new terminal window
echo "Starting Expo server..."
cd /root/projects/scoutjar/scoutjar-talent
npx expo start -c
