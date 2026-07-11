---
title: "Privileges Monitor"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/privileges-monitor
sourceBranch: main
---

# SAP Privileges Monitor

Get instant notifications when admin privileges are granted or revoked on your Mac.

## What It Does

Integrates with [SAP Privileges](https://github.com/SAP/macOS-enterprise-privileges) to send real-time notifications to [ntfy.sh](https://ntfy.sh) whenever you toggle admin privileges. Perfect for monitoring your own Mac or keeping tabs on family devices.

**Features:**
- Instant notifications via ntfy.sh (or any webhook)
- Touch ID authentication required
- Reason required (10-250 characters)
- Time limits (20 min default, 60 min max)
- JSON payload with machine name, user, state, reason, and timestamp

## Prerequisites

1. **SAP Privileges app** - [Download here](https://github.com/SAP/macOS-enterprise-privileges/releases)
2. **ntfy.sh topic** - Create one at [ntfy.sh](https://ntfy.sh) (free)

## Quick Setup

### 1. Configure

Copy the template and add your ntfy.sh details:

```bash
cp privileges_config.env.template privileges_config.env
```

Edit `privileges_config.env`:

```bash
# Your ntfy.sh topic URL
POST_URL="https://ntfy.sh/your_topic_here"

# Your ntfy.sh access token (if using auth)
AUTH_TOKEN="tk_your_token_here"
```

### 2. Install

```bash
./setup.sh
./install_profile.sh
```

The setup script installs the notification script, and the profile installer:
1. Copies the configuration profile to the user's Downloads folder
2. Opens it in System Settings
3. Prompts you to install it
4. Restarts SAP Privileges

**Important:** You must install the configuration profile in System Settings when prompted. This is what enables Touch ID, reason prompts, and the notification hook.

### 3. Test

1. Open SAP Privileges (menu bar icon)
2. Click to toggle admin privileges
3. You should see:
   - Touch ID authentication
   - Reason dialog
   - Time duration selector
4. Check your ntfy.sh topic for the notification!

## How It Works

```
User toggles privileges
       ↓
SAP Privileges prompts for Touch ID + reason
       ↓
On success, calls privileges_post_change.sh
       ↓
Script formats notification with JSON data
       ↓
Sends to ntfy.sh via webhook
       ↓
You get instant notification!
```

## Notification Format

```json
{
  "machine": "macbook-pro",
  "user": "gordon",
  "state": "admin",
  "message": "User promoted to Administrator",
  "reason": "Installing Docker Desktop",
  "time": "2026-01-29T12:30:00Z"
}
```

The ntfy.sh notification shows:
```
Title: Privilege Change: macbook-pro
Body:
  Machine: macbook-pro
  User: gordon
  Status: User promoted to Administrator
  Reason: Installing Docker Desktop
  Time: 2026-01-29T12:30:00Z
```

## Files

- **`com.sap.privileges.config.mobileconfig`** - Configuration profile for SAP Privileges
- **`privileges_post_change.sh`** - Notification script called by SAP Privileges
- **`privileges_config.env.template`** - Template for your ntfy.sh configuration
- **`setup.sh`** - Installs the notification script
- **`install_profile.sh`** - Guides you through profile installation

## Troubleshooting

### No Touch ID or reason prompt?

The configuration profile isn't installed:

```bash
# Check if installed
sudo profiles show | grep -A 5 "SAP Privileges"

# If not found, run install_profile.sh again
./install_profile.sh
```

### No notifications?

Check the script is installed and configured:

```bash
# Verify script exists
ls -la /usr/local/bin/privileges-monitor/

# Check config
cat /usr/local/bin/privileges-monitor/privileges_config.env

# Test ntfy.sh connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -d "Test message" \
     https://ntfy.sh/your_topic
```

Check system logs:

```bash
log show --predicate 'subsystem == "corp.sap.privileges"' --last 5m
log show --predicate 'process == "privileges-monitor"' --last 5m
```

### Profile won't install?

Make sure you're installing it as a **System** profile, not a User profile. When you open the `.mobileconfig` file, it should take you to System Settings > General > Device Management (or Profiles).

## Uninstall

Remove the configuration profile:
1. System Settings > General > Device Management
2. Select "SAP Privileges Configuration"
3. Click Remove

Remove the scripts:

```bash
sudo rm -rf /usr/local/bin/privileges-monitor/
```

## Security Note

This is a **"Trust but Verify"** solution. Users with admin privileges can technically disable these notifications. It's designed for environments where you want visibility without creating friction—perfect for personal Macs or family devices, not for strict enterprise lockdown.

For more robust lockdown options that work well with this setup too, see [this guide](https://gordonbeeming.com/blog/2025-11-22/locking-down-settings-the-real-way).
