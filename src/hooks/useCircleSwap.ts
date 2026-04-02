'use client';

import { useState } from 'react';
import { circleKit, createViemAdapter } from '@/lib/circle';

interface SwapParams {
  amountIn: string;
  tokenIn: string;
  tokenOut: string;
  chain: string;
  privateKey: string;
}

interface SwapResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  status?: 'pending' | 'completed' | 'failed';
  amountOut?: string;
}

export const useCircleSwap = () => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [result, setResult] = useState<SwapResult | null>(null);

  const swapTokens = async ({ amountIn, tokenIn, tokenOut, chain, privateKey }: SwapParams): Promise<SwapResult> => {
    setIsSwapping(true);
    setResult({ success: false, status: 'pending' });

    try {
      const adapter = createViemAdapter(privateKey);
      
      const swapResult = await circleKit.swap({
        from: {
          adapter,
          chain,
        },
        tokenIn,
        tokenOut,
        amountIn,
      });

      setResult({
        success: true,
        transactionHash: swapResult.steps?.[0]?.data?.txHash as string,
        status: 'completed',
        amountOut: swapResult.amountOut,
      });

      return {
        success: true,
        transactionHash: swapResult.steps?.[0]?.data?.txHash as string,
        status: 'completed',
        amountOut: swapResult.amountOut,
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
      setIsSwapping(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsSwapping(false);
  };

  return {
    swapTokens,
    isSwapping,
    result,
    reset,
  };
};
