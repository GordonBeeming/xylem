# Website Down Issue - Troubleshooting Guide

## Issue Description
The main production site (gordonbeeming.com) is returning a malformed RSC (React Server Components) payload instead of the proper HTML page:

```
0:{"b":"I8_cUpYqIivlR8hIKG7Zj","f":[["children","__PAGE__",["__PAGE__",{}],null,[null,null],true]],"S":false}
```

## Investigation Summary

### What Was Checked
1. ✅ **Docker Build**: Verified the build completes successfully and generates correct standalone output
2. ✅ **Deployment Logs**: Both preview and production deployments completed without errors
3. ✅ **Docker Image**: Same image (sha-b70521c) deployed to both preview and production
4. ✅ **Local Testing**: Standalone server works correctly locally, returning proper HTML
5. ✅ **Content Layer**: All blog post data is correctly included in the build
6. ✅ **Static Files**: All `.next/static` files are properly copied in the Dockerfile

### Key Findings
- **Preview environment works fine** with the same Docker image
- **Production environment shows the RSC payload error**
- **Deployments completed successfully** - services restarted properly
- **The code and Docker image are correct** - not a build issue

## Root Cause
The issue is **NOT in the codebase** but in the external infrastructure, most likely one of:

1. **CDN/Cloudflare Cache**: A CDN in front of production is serving a stale/broken cached response
2. **Reverse Proxy Misconfiguration**: The nginx/caddy proxy for production might be:
   - Forwarding requests with incorrect headers (causing RSC-only responses)
   - Not properly proxying to the container
   - Serving cached content
3. **Browser Cache**: User's browser has cached the broken state

## Immediate Solutions

### Option 1: Clear CDN Cache (Most Likely Fix)
If using Cloudflare or another CDN:
1. Log into the CDN dashboard
2. Navigate to Caching settings
3. Click "Purge Everything" or "Purge Cache"
4. Wait 1-2 minutes
5. Try accessing the site again

### Option 2: Check Reverse Proxy Configuration
SSH into the production server and check:

```bash
# Check if the service is running
systemctl --user status gordonbeeming-production.service

# Check service logs
journalctl --user -u gordonbeeming-production.service -n 100

# Check if the container is responding correctly
curl -I http://localhost:3000/  # Or whatever port the container uses

# Check nginx/caddy configuration
# Look for any header manipulation that might cause RSC-only responses
```

### Option 3: Force Browser Hard Refresh
1. Open the site in an incognito/private window
2. Or try Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. Or clear browser cache completely

### Option 4: Verify Container Health
```bash
# Check the running container
podman ps | grep gordonbeeming

# Check container logs
podman logs <container-id> --tail 100

# Test the container directly
curl -H "Host: gordonbeeming.com" http://localhost:<container-port>/
```

## Technical Details

### Why Preview Works But Production Doesn't
Both environments use the same Docker image, so the difference must be in:
- Different CDN/caching setup
- Different reverse proxy configuration  
- Different domain-specific settings

### What the RSC Payload Error Means
Next.js 16 uses React Server Components (RSC) which stream data to the client. The payload shown (`0:{"b":"..."}`) is the raw streaming data without the HTML wrapper. This typically happens when:
- The request has RSC-specific headers but the server returns only the payload
- A proxy/CDN is corrupting or caching partial responses
- The routing layer is treating all requests as RSC fetch requests

## Prevention
To prevent this in the future:
1. **Always purge CDN cache** after deployments
2. **Add health check monitoring** - use `/api/health` endpoint
3. **Configure CDN properly** - ensure it respects cache-control headers
4. **Test in incognito** - always verify deployments in a fresh browser context

## Need Help?
If these steps don't resolve the issue:
1. Check the production reverse proxy logs
2. Verify DNS settings point to the correct server
3. Confirm no firewall rules are interfering
4. Test the container directly (bypassing the reverse proxy)
