# ArcFX

Multichain DEX on Arc Testnet - A cross-chain swap interface powered by Circle CCTP.

## Features

- ⚡ Fast Finality - Sub-second deterministic settlement
- 💰 USDC Gas - Predictable fees in stablecoins
- 🌐 Multichain - Powered by Circle CCTP
- Cross-chain swapping between Arc Testnet, Ethereum Sepolia, and Polygon Amoy

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Hardhat** - Local blockchain development
- **Ethers.js v6** - Blockchain interactions
- **Solidity** - Smart contracts

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
ARC/
├── components/
│   └── ArcFX.tsx          # Main swap interface component
├── contracts/
│   ├── MockUSDC.sol       # Mock USDC token for testing
│   └── SwapBridge.sol     # Swap/bridge contract
├── scripts/
│   └── deploy.ts          # Deployment script
├── pages/
│   ├── _app.tsx           # Next.js app wrapper
│   └── index.tsx          # Home page
├── styles/
│   └── globals.css        # Global styles with Tailwind
├── types/
│   └── window.d.ts        # TypeScript declarations
├── hardhat.config.ts      # Hardhat configuration
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Chain Configuration

The app supports the following testnet chains:

- **Arc Testnet** (Chain ID: 5042002)
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Polygon Amoy** (Chain ID: 80002)

## Wallet Connection

The app requires a Web3 wallet (like MetaMask) to connect. Make sure you have:
- MetaMask or another compatible wallet installed
- The wallet configured for the supported testnets

## Local Testing with Real Transactions

You can test real transactions on a local Hardhat blockchain! Here's how:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Local Hardhat Node

In a separate terminal, start the Hardhat local blockchain:

```bash
npm run chain
```

This will start a local Ethereum node on `http://127.0.0.1:8545` with 20 pre-funded accounts.

### Step 3: Deploy Contracts

In another terminal, deploy the contracts to localhost:

```bash
npm run compile
npm run deploy:local
```

This will deploy:
- **MockUSDC**: A mock USDC token (6 decimals) with 1,000,000 tokens minted to deployer
- **SwapBridge**: A swap/bridge contract for cross-chain swaps

The deployment script will output contract addresses. Copy them to your `.env.local` file.

### Step 4: Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_USDC_ADDRESS=<address from deployment>
NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS=<address from deployment>
NEXT_PUBLIC_LOCAL_CHAIN_ID=31337
NEXT_PUBLIC_LOCAL_RPC=http://127.0.0.1:8545
```

### Step 5: Setup MetaMask

1. **Add Localhost Network to MetaMask:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Hardhat Account:**
   - When you run `npm run chain`, Hardhat will display private keys for test accounts
   - Import the first account's private key into MetaMask
   - This account has the initial USDC balance and ETH for gas

### Step 6: Start Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and:

1. Connect your MetaMask wallet
2. Select "Localhost" as the chain
3. You should see your USDC balance
4. Try swapping tokens!

### Contracts

- **MockUSDC.sol**: ERC20 token with 6 decimals (like real USDC)
  - Automatically mints 1,000,000 tokens to deployer
  - Owner can mint more tokens for testing

- **SwapBridge.sol**: Simple swap contract
  - 0.1% bridge fee (configurable)
  - Minimum swap amount: 1 USDC
  - Transfers tokens to contract (in production, would lock and bridge)

### Testing Tips

1. **Get More USDC**: The MockUSDC contract owner can mint more tokens. Use Hardhat console:
   ```bash
   npx hardhat console --network localhost
   > const MockUSDC = await ethers.getContractFactory("MockUSDC")
   > const usdc = MockUSDC.attach("YOUR_USDC_ADDRESS")
   > await usdc.mint("YOUR_ADDRESS", ethers.parseUnits("1000", 6))
   ```

2. **Check Balances**: Use Hardhat console to check contract balances

3. **View Transactions**: All transactions happen on your local node instantly

## Demo Mode

For testnet deployment:

1. Get testnet USDC from [Circle Faucet](https://faucet.circle.com)
2. Deploy contracts to testnets
3. Configure environment variables with testnet addresses
4. Never expose private keys in client-side code
5. Use proper key management and signing services

## Resources

- [Arc Network Docs](https://docs.arc.network)
- [Arc Testnet Explorer](https://testnet.arcscan.app)
- [Circle Faucet](https://faucet.circle.com)

## License

MIT

