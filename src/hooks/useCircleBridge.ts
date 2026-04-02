'use client';

import { useState } from 'react';
import { circleKit, SUPPORTED_CHAINS, SupportedChain, createViemAdapter } from '@/lib/circle';

interface BridgeParams {
  amount: string;
  fromChain: SupportedChain;
  toChain: SupportedChain;
  privateKey: string;
}

interface BridgeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  status?: 'pending' | 'completed' | 'failed';
  steps?: any[];
}

export const useCircleBridge = () => {
  const [isBridging, setIsBridging] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);

  const bridgeUSDC = async ({ amount, fromChain, toChain, privateKey }: BridgeParams): Promise<BridgeResult> => {
    setIsBridging(true);
    setResult({ success: false, status: 'pending' });

    try {
      const adapter = createViemAdapter(privateKey);
      
      const bridgeResult = await circleKit.bridge({
        from: {
          adapter,
          chain: SUPPORTED_CHAINS[fromChain],
        },
        to: {
          adapter,
          chain: SUPPORTED_CHAINS[toChain],
        },
        amount,
      });

      setResult({
        success: true,
        transactionHash: bridgeResult.steps?.[0]?.data?.txHash as string,
        status: 'completed',
        steps: bridgeResult.steps,
      });

      return {
        success: true,
        transactionHash: bridgeResult.steps?.[0]?.data?.txHash as string,
        status: 'completed',
        steps: bridgeResult.steps,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setResult({
        success: false,
        error: errorMessage,
        status: 'failed',
      });

      return {
        success: false,
        error: errorMessage,
        status: 'failed',
      };
    } finally {
      setIsBridging(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsBridging(false);
  };

  return {
    bridgeUSDC,
    isBridging,
    result,
    reset,
  };
};
