# Troubleshooting Balance Loading Issues

## Common Issues and Solutions

### 1. Balance Shows 0.00 or Not Loading

**Possible Causes:**
- Wallet not connected to correct network
- No tokens in wallet
- Network mismatch

**Solutions:**

#### Check Network Connection
1. Make sure MetaMask is connected to **Arc Testnet** (Chain ID: 5042002)
2. The app should auto-switch, but verify in MetaMask:
   - Network dropdown should show "Arc Testnet"
   - Chain ID: 5042002
   - RPC: https://rpc.testnet.arc.network

#### Check Token Balance
1. Open MetaMask
2. Click on "Arc Testnet" network
3. Check if you have USDC or EURC tokens
4. If balance is 0, get testnet tokens from:
   - **USDC**: https://faucet.circle.com (Select Arc Testnet → USDC)
   - **EURC**: https://faucet.circle.com (Select Arc Testnet → EURC)

#### Verify Contract Address
- **USDC**: `0x3600000000000000000000000000000000000000`
- **EURC**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

### 2. Network Mismatch Error

**Error Message:** "Please switch to Arc Testnet (Chain ID: 5042002)"

**Solution:**
1. The app should auto-switch, but if it fails:
2. Manually switch in MetaMask:
   - Click network dropdown
   - Select "Arc Testnet"
   - If not listed, add it:
     - Network Name: Arc Testnet
     - RPC URL: https://rpc.testnet.arc.network
     - Chain ID: 5042002
     - Currency Symbol: USDC

### 3. Console Errors

**Check Browser Console:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages

**Common Errors:**

#### "No signer available"
- **Cause**: Wallet not connected
- **Solution**: Click "Connect Wallet" button

#### "Network mismatch"
- **Cause**: Wrong network selected
- **Solution**: Switch to Arc Testnet

#### "Contract call failed"
- **Cause**: Network issue or contract address wrong
- **Solution**: 
  - Verify network connection
  - Refresh page
  - Try again

### 4. Balance Shows 0.00 but Wallet Has Tokens

**Possible Causes:**
- Wrong token selected (USDC vs EURC)
- Wrong network
- Contract address mismatch

**Solutions:**

1. **Check Token Selection:**
   - Make sure correct token is selected (USDC or EURC)
   - Token selector only shows for Arc Testnet

2. **Verify Network:**
   - Must be on Arc Testnet
   - Check MetaMask network indicator

3. **Refresh Balance:**
   - Click "Refresh" button next to balance
   - Wait a few seconds
   - Check console for errors

### 5. Getting Testnet Tokens

**USDC:**
1. Visit: https://faucet.circle.com
2. Connect wallet
3. Select "Arc Testnet" network
4. Select "USDC" token
5. Request testnet USDC
6. Wait for tokens to arrive

**EURC:**
1. Visit: https://faucet.circle.com
2. Connect wallet
3. Select "Arc Testnet" network
4. Select "EURC" token
5. Request testnet EURC
6. Wait for tokens to arrive

### 6. Debug Steps

1. **Check Browser Console:**
   ```
   - Open DevTools (F12)
   - Check Console tab
   - Look for error messages
   ```

2. **Verify Network:**
   ```
   - MetaMask should show "Arc Testnet"
   - Chain ID should be 5042002
   ```

3. **Check Contract Address:**
   ```
   - USDC: 0x3600000000000000000000000000000000000000
   - EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
   ```

4. **Verify Wallet:**
   ```
   - Wallet should be connected
   - Account should have balance
   ```

5. **Test Contract:**
   - Visit: https://testnet.arcscan.app
   - Paste your wallet address
   - Check token balances

### 7. Still Not Working?

1. **Refresh the Page:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Disconnect and Reconnect:**
   - Disconnect wallet in MetaMask
   - Refresh page
   - Connect again

3. **Clear Browser Cache:**
   - Clear cache and cookies
   - Refresh page

4. **Check MetaMask:**
   - Update MetaMask to latest version
   - Restart browser

5. **Network Issues:**
   - Check internet connection
   - Try different network
   - Wait a few minutes and retry

## Quick Checklist

- [ ] Wallet connected
- [ ] On Arc Testnet (Chain ID: 5042002)
- [ ] Have USDC or EURC tokens
- [ ] Correct token selected
- [ ] No console errors
- [ ] Contract addresses correct
- [ ] Network connection stable

## Still Having Issues?

Check the browser console for detailed error messages and share them for further debugging.

---

**Last Updated:** After balance loading improvements with better error handling and network verification.

