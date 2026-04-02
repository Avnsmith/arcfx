'use client';

import { useState } from 'react';
import { BridgeForm } from '@/components/BridgeForm';
import { SwapForm } from '@/components/SwapForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, Coins } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'bridge' | 'swap'>('bridge');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ArcFX</h1>
          <p className="text-lg text-gray-600">
            Bridge USDC from Sepolia to Arc and swap tokens seamlessly
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Card className="inline-flex p-1">
            <CardContent className="p-0">
              <div className="flex gap-1">
                <Button
                  variant={activeTab === 'bridge' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bridge')}
                  className="flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Bridge
                </Button>
                <Button
                  variant={activeTab === 'swap' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('swap')}
                  className="flex items-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  Swap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {activeTab === 'bridge' ? (
              <BridgeForm />
            ) : (
              <SwapForm />
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How it works</CardTitle>
                <CardDescription>
                  Learn about ArcFX capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">🌉 Bridge USDC</h4>
                  <p className="text-sm text-gray-600">
                    Use Circle's CCTP to securely transfer USDC from Ethereum Sepolia to Arc Testnet with minimal fees and fast finality.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💱 Swap Tokens</h4>
                  <p className="text-sm text-gray-600">
                    Exchange USDC for ETH and other tokens directly on Arc Testnet using Circle's App Kit.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔒 Secure</h4>
                  <p className="text-sm text-gray-600">
                    Your private key is used locally in your browser. No data is sent to external servers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  What you'll need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Test ETH from Sepolia faucet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">USDC from Circle faucet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Arc Testnet USDC for gas fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Your wallet private key</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
