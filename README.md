# ArcFX

A modern web application for bridging USDC from Ethereum Sepolia to Arc Testnet and swapping tokens using Circle's App Kit and CCTP.

## Features

- 🌉 **Bridge USDC**: Transfer USDC from Ethereum Sepolia to Arc Testnet using Circle's Cross-Chain Transfer Protocol (CCTP)
- 💱 **Swap Tokens**: Exchange USDC for ETH and other tokens directly on Arc Testnet
- 🔒 **Secure**: Private keys are used locally in the browser, no external server communication
- 🎨 **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS
- ⚡ **Fast**: Sub-second finality on Arc Testnet with minimal fees

## Getting Started

### Prerequisites

1. Node.js v22+ installed
2. Test ETH from [Sepolia faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
3. USDC from [Circle faucet](https://faucet.circle.com)
4. Arc Testnet USDC for gas fees from Circle faucet
5. Your wallet private key

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Bridging USDC

1. Select the "Bridge" tab
2. Enter the amount of USDC to bridge
3. Choose the source and destination chains (Sepolia → Arc Testnet)
4. Enter your private key
5. Click "Bridge USDC"

### Swapping Tokens

1. Select the "Swap" tab
2. Choose the chain (Arc Testnet or Ethereum Sepolia)
3. Select the tokens to swap (USDC ↔ ETH)
4. Enter the amount and your private key
5. Click "Swap Tokens"

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Blockchain Integration**: Circle App Kit with CCTP
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React hooks for bridge and swap operations

## Security Notes

- Private keys are used locally in the browser only
- No data is sent to external servers
- Always verify you're on the correct domain before entering private keys
- Consider using a hardware wallet for production use

## Network Details

- **Ethereum Sepolia**: Chain ID 11155111
- **Arc Testnet**: Chain ID 97420
- **RPC URLs**: Configured automatically

## Learn More

- [Circle App Kit Documentation](https://docs.arc.network/app-kit)
- [Arc Network Documentation](https://docs.arc.network)
- [CCTP Documentation](https://developers.circle.com/cctp)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
