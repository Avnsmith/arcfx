'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCircleBridge } from '@/hooks/useCircleBridge';
import { SupportedChain } from '@/lib/circle';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

export const BridgeForm = () => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState<SupportedChain>('sepolia');
  const [toChain, setToChain] = useState<SupportedChain>('arcTestnet');
  const [privateKey, setPrivateKey] = useState('');
  const { bridgeUSDC, isBridging, result, reset } = useCircleBridge();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !privateKey) return;

    await bridgeUSDC({ amount, fromChain, toChain, privateKey });
  };

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Bridge USDC
        </CardTitle>
        <CardDescription>
          Transfer USDC from Sepolia to Arc Testnet using CCTP
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (USDC)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="1.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isBridging}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">From Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value as SupportedChain)}
              disabled={isBridging}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="sepolia">Ethereum Sepolia</option>
              <option value="arcTestnet">Arc Testnet</option>
            </select>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapChains}
              disabled={isBridging}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To Chain</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(e.target.value as SupportedChain)}
              disabled={isBridging}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="sepolia">Ethereum Sepolia</option>
              <option value="arcTestnet">Arc Testnet</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Private Key</label>
            <Input
              type="password"
              placeholder="Enter your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isBridging}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your private key is used locally to sign transactions
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isBridging}>
            {isBridging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging...
              </>
            ) : (
              'Bridge USDC'
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Bridge Successful!' : 'Bridge Failed'}
              </h4>
              {result.transactionHash && (
                <p className="text-sm text-green-700 mt-1">
                  Transaction: {result.transactionHash}
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
