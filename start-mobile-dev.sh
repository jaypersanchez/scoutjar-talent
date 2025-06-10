#!/bin/bash

# WSL Side Setup for Android + Expo Mobile Development

# Set ANDROID_HOME and PATH to prioritize Linux-native adb
export ANDROID_HOME=/usr/local  # not the real Android SDK but fakes out React Native
export PATH="/usr/local/bin:$PATH"

# 1. Start socat bridge if not running
echo "🔌 Starting socat to bridge ADB..."
if pgrep socat > /dev/null; then
    echo "✅ Socat already running."
else
    nohup socat TCP-LISTEN:5037,fork TCP:127.0.0.1:5037 > /dev/null 2>&1 &
    echo "🚀 Socat started."
fi

# 2. Confirm ADB is available
echo "🔍 Checking ADB..."
if ! command -v adb > /dev/null; then
    echo "❌ ADB not found. Please install android-tools-adb."
    exit 1
fi
adb devices

# 3. Start Expo project
echo "📂 Navigating to Expo project..."
cd /root/projects/scoutjar/scoutjar-talent || {
    echo "❌ Failed to change directory. Please check the path."
    exit 1
}

echo "🚀 Starting Expo with tunnel mode..."
npx expo start --dev-client --tunnel -c
# EXPO_NO_DEV_CLIENT=1 npx expo start --tunnel -c
