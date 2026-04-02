'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCircleSwap } from '@/hooks/useCircleSwap';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

export const SwapForm = () => {
  const [amountIn, setAmountIn] = useState('');
  const [tokenIn, setTokenIn] = useState('USDC');
  const [tokenOut, setTokenOut] = useState('ETH');
  const [chain, setChain] = useState('Arc_Testnet');
  const [privateKey, setPrivateKey] = useState('');
  const { swapTokens, isSwapping, result, reset } = useCircleSwap();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountIn || !privateKey) return;

    await swapTokens({ amountIn, tokenIn, tokenOut, chain, privateKey });
  };

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Swap Tokens
        </CardTitle>
        <CardDescription>
          Swap USDC for ETH on Arc Testnet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chain</label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              disabled={isSwapping}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Arc_Testnet">Arc Testnet</option>
              <option value="Ethereum_Sepolia">Ethereum Sepolia</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Token</label>
            <div className="flex gap-2">
              <select
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value)}
                disabled={isSwapping}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
              <Input
                type="number"
                step="0.01"
                placeholder="1.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                disabled={isSwapping}
                required
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapTokens}
              disabled={isSwapping}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To Token</label>
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              disabled={isSwapping}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Private Key</label>
            <Input
              type="password"
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isSwapping}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your private key is used locally to sign transactions
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSwapping}>
            {isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap Tokens'
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Swap Successful!' : 'Swap Failed'}
              </h4>
              {result.transactionHash && (
                <p className="text-sm text-green-700 mt-1">
                  Transaction: {result.transactionHash}
                </p>
              )}
              {result.amountOut && (
                <p className="text-sm text-green-700 mt-1">
                  Received: {result.amountOut} {tokenOut}
                </p>
              )}
              {result.error && (
                <p className="text-sm text-red-700 mt-1">{result.error}</p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
