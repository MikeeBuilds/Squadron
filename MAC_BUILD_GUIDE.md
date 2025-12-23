# 🍎 Squadron macOS Build Guide

Since you have an **Apple Developer Account**, you can build a fully signed and notarized application that won't show the "malicious software" warning to users.

## 1. Prerequisites

On your Mac, ensure you have:
- **Node.js** (v18 or newer): `brew install node`
- **Git**: `brew install git`
- **Xcode Command Line Tools**: `xcode-select --install`

## 2. Certificates & Credentials [IMPORTANT]

### A. Install Certificates
1. Open **Xcode** -> Settings -> Accounts.
2. Sign in with your **Apple ID**.
3. Click "Manage Certificates".
4. Ensure **"Developer ID Application"** is created and installed.
   - You can verify this in the **Keychain Access** app on Mac. Search for "Developer ID Application".

### B. Generate App-Specific Password
1. Go to [appleid.apple.com](https://appleid.apple.com).
2. Sign in -> App-Specific Passwords -> Generate.
3. Name it "Squadron Notarization".
4. Copy the password (format: `xxxx-xxxx-xxxx-xxxx`).

## 3. Setup Project

1. **Clone the repo:**
   ```bash
   git clone https://github.com/MikeeBuilds/Squadron.git
   cd Squadron/desktop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   You must set these before building. You can export them in your terminal session:

   ```bash
   # Your Apple ID email
   export APPLE_ID="your-email@icloud.com"

   # The app-specific password you generated above
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"

   # Your 10-character Team ID (found at developer.apple.com/account)
   export TEAM_ID="YOUR_TEAM_ID"
   
   # Enable auto-discovery of the cert in Keychain
   export CSC_IDENTITY_AUTO_DISCOVERY=true
   ```

## 4. Build & Sign

Run the build command:

```bash
npm run electron:build:mac
```

This will:
1. Compile the React app.
2. Package it into a `.dmg` and `.app`.
3. **Sign** the code with your certificate.
4. **Notarize** it with Apple's servers (this takes 2-5 minutes, wait for it!).

## 5. Result

You will find the output in:
`desktop/release/Squadron-2.0.0.dmg`

This is the file you verify (it should open without warnings) and verify the **"Traffic Light"** buttons in the UI look correct (we configured `hiddenInset` mode for native macOS feel).

Then upload it to the [GitHub Desktop Release](https://github.com/MikeeBuilds/Squadron/releases/tag/v2.0.0).
