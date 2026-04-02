import { AppKit } from '@circle-fin/app-kit';
import { createViemAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';
import { http } from 'viem';
import { sepolia } from 'viem/chains';

// Arc Testnet configuration
const arcTestnet = {
  id: 97420,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.testnet.arc.network' },
  },
  testnet: true,
};

export const createCircleKit = () => {
  const kit = new AppKit();
  return kit;
};

export const circleKit = createCircleKit();

export const createViemAdapter = (privateKey: string) => {
  return createViemAdapterFromPrivateKey({
    privateKey,
  });
};

export const SUPPORTED_CHAINS = {
  sepolia: 'Ethereum_Sepolia',
  arcTestnet: 'Arc_Testnet',
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;
