# USDC & EURC Contract Integration ✅

## Official Arc Testnet Contract Addresses

Based on the [Arc Network Documentation](https://docs.arc.network/arc/references/contract-addresses), the following official contract addresses have been integrated:

### USDC (USD Coin)
- **Contract Address**: `0x3600000000000000000000000000000000000000`
- **Description**: Optional ERC-20 interface for interacting with the native USDC balance
- **Decimals**: 6
- **Explorer**: https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000
- **Faucet**: https://faucet.circle.com (Select Arc Testnet and USDC)

### EURC (Euro Coin)
- **Contract Address**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
- **Description**: Main EURC token contract - euro-denominated stablecoin issued by Circle
- **Decimals**: 6
- **Explorer**: https://testnet.arcscan.app/address/0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
- **Faucet**: https://faucet.circle.com (Select Arc Testnet and EURC)

## Features Added

### 1. Token Selection
- ✅ Token selector UI (USDC/EURC) when Arc Testnet is selected
- ✅ Toggle between USDC and EURC tokens
- ✅ Visual indication of selected token

### 2. Balance Loading
- ✅ Automatically loads balance for selected token
- ✅ Shows correct token symbol (USDC or EURC) in balance display
- ✅ Handles 6 decimals for both tokens

### 3. Contract Integration
- ✅ Uses official Arc Testnet contract addresses
- ✅ ERC-20 standard interface for both tokens
- ✅ Supports balance checking, transfers, and approvals

### 4. UI Updates
- ✅ Token selection buttons for Arc Testnet
- ✅ Contract addresses displayed with explorer links
- ✅ Updated balance display to show selected token
- ✅ Fee estimation uses selected token

## How It Works

### For Arc Testnet:

1. **Select Token**: Choose USDC or EURC using the token selector
2. **Connect Wallet**: Wallet connects to Arc Testnet automatically
3. **View Balance**: Balance loads for the selected token
4. **Swap**: Ready to swap the selected token

### For Other Chains:

- Defaults to USDC (as configured per chain)
- Token selector hidden (only available for Arc Testnet)

## Contract Details

### USDC Contract
- **Type**: ERC-20 interface for native USDC
- **Note**: Native USDC gas token uses 18 decimals, but ERC-20 interface uses 6 decimals
- **Usage**: Recommended to use ERC-20 interface for balance reading and transfers

### EURC Contract
- **Type**: Standard ERC-20 token
- **Issuer**: Circle
- **Usage**: Full ERC-20 functionality (transfer, approve, allowance)

## Testing

### Get Testnet Tokens:

1. **USDC**:
   - Visit: https://faucet.circle.com
   - Network: Arc Testnet
   - Token: USDC
   - Request testnet USDC

2. **EURC**:
   - Visit: https://faucet.circle.com
   - Network: Arc Testnet
   - Token: EURC
   - Request testnet EURC

### Test in App:

1. Connect wallet to Arc Testnet
2. Select token (USDC or EURC)
3. View balance for selected token
4. Test swap functionality (when contracts are deployed)

## Documentation Reference

- **Arc Contract Addresses**: https://docs.arc.network/arc/references/contract-addresses
- **USDC Details**: Native EVM asset, used for gas fees
- **EURC Details**: Euro-denominated stablecoin for payments and FX

## Implementation Notes

- Both tokens use 6 decimals
- Contract addresses are hardcoded from official Arc documentation
- Token selector only appears when Arc Testnet is selected
- Balance updates automatically when token is changed
- All contract interactions use ethers.js v6

---

**All contract addresses verified from official Arc Network documentation!** ✅

