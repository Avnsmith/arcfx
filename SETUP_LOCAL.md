# Quick Setup Guide for Local Testing

## Prerequisites

- Node.js 18+ installed
- MetaMask browser extension

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Blockchain (Terminal 1)

```bash
npm run chain
```

Keep this terminal running. You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts:
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Important**: Save the first account's private key - you'll import it into MetaMask!

### 3. Deploy Contracts (Terminal 2)

In a new terminal:

```bash
npm run compile
npm run deploy:local
```

You'll see output with contract addresses. Copy them!

### 4. Create Environment File

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_USDC_ADDRESS=<paste USDC address from deployment>
NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS=<paste SwapBridge address from deployment>
NEXT_PUBLIC_LOCAL_CHAIN_ID=31337
NEXT_PUBLIC_LOCAL_RPC=http://127.0.0.1:8545
```

### 5. Setup MetaMask

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Enter:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Click "Save"

5. Import the Hardhat account:
   - Click MetaMask icon → Click your account → "Import Account"
   - Paste the private key from Terminal 1 (Account #0)
   - You now have 10,000 ETH and USDC balance!

### 6. Start Frontend (Terminal 3)

```bash
npm run dev
```

### 7. Test It!

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select "Localhost" network in the dropdown
4. You should see your USDC balance
5. Enter an amount and click "Swap"!

## Troubleshooting

**"Localhost contracts not configured"**
- Make sure `.env.local` exists with correct addresses
- Restart the dev server after creating `.env.local`

**"Failed to connect wallet"**
- Make sure MetaMask is installed
- Make sure you've added the Localhost network

**"Insufficient balance"**
- The deployer account gets all USDC initially
- Use the first Hardhat account (Account #0) in MetaMask
- Or mint more USDC using Hardhat console

**MetaMask shows wrong balance**
- Refresh the page
- Click the refresh button next to balance
- Make sure you're on the Localhost network in MetaMask

## Getting More USDC

If you need more tokens, use Hardhat console:

```bash
npx hardhat console --network localhost
```

Then:
```javascript
const MockUSDC = await ethers.getContractFactory("MockUSDC")
const usdc = MockUSDC.attach("YOUR_USDC_ADDRESS")
const [signer] = await ethers.getSigners()
await usdc.mint(await signer.getAddress(), ethers.parseUnits("1000", 6))
```

Replace `YOUR_USDC_ADDRESS` with your actual USDC contract address.

