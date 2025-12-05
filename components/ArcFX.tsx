'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDownUp, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { ethers } from 'ethers';

// ERC20 ABI (simplified for balance and transfer)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// SwapBridge ABI
const SWAP_BRIDGE_ABI = [
  "function swap(address token, uint256 amount, uint256 destinationChainId) external",
  "function bridgeFeeBps() view returns (uint256)",
  "function minSwapAmount() view returns (uint256)"
];

const ArcFX = () => {
  const [fromChain, setFromChain] = useState('Localhost');
  const [toChain, setToChain] = useState('Localhost');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [copied, setCopied] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState('0.01');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [usdcDecimals, setUsdcDecimals] = useState(6);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Chain configurations
  const chains: Record<string, any> = {
    Localhost: {
      name: 'Localhost',
      chainId: 31337,
      token: 'USDC',
      rpc: 'http://127.0.0.1:8545',
      explorer: 'http://localhost:8545',
      usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
      swapBridgeAddress: process.env.NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS || '',
      color: 'from-green-500 to-emerald-500'
    },
    Arc_Testnet: {
      name: 'Arc Testnet',
      chainId: 5042002,
      token: 'USDC',
      rpc: 'https://rpc.testnet.arc.network',
      explorer: 'https://testnet.arcscan.app',
      usdcAddress: '0x3600000000000000000000000000000000000000',
      cctpDomain: 26,
      color: 'from-blue-500 to-cyan-500'
    },
    Ethereum_Sepolia: {
      name: 'Ethereum Sepolia',
      chainId: 11155111,
      token: 'USDC',
      rpc: 'https://sepolia.infura.io/v3/',
      explorer: 'https://sepolia.etherscan.io',
      usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      cctpDomain: 0,
      color: 'from-purple-500 to-pink-500'
    },
    Polygon_Amoy: {
      name: 'Polygon Amoy',
      chainId: 80002,
      token: 'USDC',
      rpc: 'https://rpc-amoy.polygon.technology',
      explorer: 'https://www.oklink.com/amoy',
      usdcAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      cctpDomain: 7,
      color: 'from-violet-500 to-purple-500'
    }
  };

  // Check if localhost is configured
  useEffect(() => {
    setIsLocalhost(
      chains[fromChain]?.chainId === 31337 || 
      !!(process.env.NEXT_PUBLIC_USDC_ADDRESS && process.env.NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS)
    );
  }, [fromChain]);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send('eth_requestAccounts', []);
        
        if (accounts.length === 0) {
          alert('No accounts found');
          return;
        }

        const account = accounts[0];
        setWalletAddress(account);
        setIsConnected(true);
        setProvider(web3Provider);
        
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);

        // Check and switch network if needed
        await checkAndSwitchNetwork();

        // Load balance
        await loadBalance();
      } catch (error: any) {
        alert('Failed to connect wallet: ' + error.message);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  // Check and switch to localhost network
  const checkAndSwitchNetwork = async () => {
    if (!provider || !isLocalhost) return;

    try {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(31337)) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7A69', // 31337 in hex
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: null,
            }],
          });
        } catch (addError: any) {
          if (addError.code !== 4902) {
            throw addError;
          }
        }

        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }],
        });
      }
    } catch (error: any) {
      console.error('Network switch error:', error);
      alert('Please switch to Localhost network (Chain ID: 31337) in MetaMask');
    }
  };

  // Load USDC balance
  const loadBalance = async () => {
    if (!signer || !chains[fromChain]?.usdcAddress || !isLocalhost) {
      return;
    }

    try {
      const usdcContract = new ethers.Contract(
        chains[fromChain].usdcAddress,
        ERC20_ABI,
        signer
      );

      const balance = await usdcContract.balanceOf(walletAddress);
      const decimals = await usdcContract.decimals();
      setUsdcDecimals(decimals);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (error: any) {
      console.error('Error loading balance:', error);
      setBalance('0.00');
    }
  };

  // Refresh balance
  useEffect(() => {
    if (isConnected && isLocalhost) {
      loadBalance();
    }
  }, [fromChain, isConnected, isLocalhost, walletAddress]);

  // Copy address
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Estimate fee
  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && isLocalhost && signer) {
      estimateFee();
    } else if (amount && parseFloat(amount) > 0) {
      const baseFee = 0.01;
      const bridgeFee = parseFloat(amount) * 0.001;
      setEstimatedFee((baseFee + bridgeFee).toFixed(4));
    }
  }, [amount, isLocalhost, signer]);

  // Estimate fee from contract
  const estimateFee = async () => {
    if (!signer || !chains[fromChain]?.swapBridgeAddress) return;

    try {
      const swapBridge = new ethers.Contract(
        chains[fromChain].swapBridgeAddress,
        SWAP_BRIDGE_ABI,
        signer
      );

      const feeBps = await swapBridge.bridgeFeeBps();
      const amountWei = ethers.parseUnits(amount, usdcDecimals);
      const fee = (amountWei * feeBps) / BigInt(10000);
      
      setEstimatedFee(ethers.formatUnits(fee, usdcDecimals));
    } catch (error) {
      console.error('Error estimating fee:', error);
    }
  };

  // Handle swap with real transaction
  const handleSwap = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      alert('Insufficient balance');
      return;
    }

    if (!isLocalhost || !signer || !chains[fromChain]?.usdcAddress || !chains[fromChain]?.swapBridgeAddress) {
      alert('Localhost contracts not configured. Please set NEXT_PUBLIC_USDC_ADDRESS and NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS in .env.local');
      return;
    }

    setIsSwapping(true);
    
    try {
      const usdcContract = new ethers.Contract(
        chains[fromChain].usdcAddress,
        ERC20_ABI,
        signer
      );

      const swapBridgeContract = new ethers.Contract(
        chains[fromChain].swapBridgeAddress,
        SWAP_BRIDGE_ABI,
        signer
      );

      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount, usdcDecimals);

      // Check allowance
      const allowance = await usdcContract.allowance(
        walletAddress,
        chains[fromChain].swapBridgeAddress
      );

      // Approve if needed
      if (allowance < amountWei) {
        console.log('Approving USDC...');
        const approveTx = await usdcContract.approve(
          chains[fromChain].swapBridgeAddress,
          ethers.MaxUint256
        );
        await approveTx.wait();
        console.log('Approval confirmed');
      }

      // Execute swap
      console.log('Executing swap...');
      const swapTx = await swapBridgeContract.swap(
        chains[fromChain].usdcAddress,
        amountWei,
        chains[toChain]?.chainId || 31337
      );

      const receipt = await swapTx.wait();
      
      setTxHash(receipt.hash);
      
      // Refresh balance
      await loadBalance();

      alert(`Success! Swap transaction confirmed.\nFrom: ${chains[fromChain].name}\nTo: ${chains[toChain].name}\nAmount: ${amount} USDC\nTx: ${receipt.hash}`);
    } catch (error: any) {
      console.error('Transaction error:', error);
      alert('Transaction failed: ' + (error.reason || error.message));
    } finally {
      setIsSwapping(false);
    }
  };

  // Swap chains
  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const currentChain = chains[fromChain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                ArcFX
              </span>
              {isLocalhost && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Local Mode</span>
              )}
            </h1>
            <p className="text-blue-200">Multichain DEX on Arc Testnet</p>
          </div>
          
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-500/30">
              <div className="text-xs text-blue-300 mb-1">Connected</div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="text-sm text-cyan-400 mt-1">
                Balance: {balance} USDC
              </div>
              <button
                onClick={loadBalance}
                className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-400 mt-0.5" size={20} />
            <div className="text-sm text-blue-100">
              {isLocalhost ? (
                <>
                  <strong>Local Testing Mode:</strong> Connected to local Hardhat node. 
                  Make sure Hardhat node is running (`npm run chain`) and contracts are deployed (`npm run deploy:local`).
                </>
              ) : (
                <>
                  <strong>Gas Fees Paid in USDC!</strong> Arc testnet uses USDC as native gas token. 
                  All fees are paid in stablecoins for predictable costs (~$0.01 per transaction).
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Swap Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Cross-Chain Swap</h2>
          
          {/* From Chain */}
          <div className="mb-4">
            <label className="text-sm text-blue-300 mb-2 block">From</label>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <select
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
                className="w-full bg-transparent text-white text-lg mb-3 outline-none cursor-pointer"
              >
                {Object.entries(chains).map(([key, chain]) => (
                  <option key={key} value={key} className="bg-slate-800">
                    {chain.name}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-3xl text-white outline-none"
                step="0.01"
                min="0"
              />
              <div className="text-sm text-slate-400 mt-2">
                Available: {balance} USDC
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={swapChains}
              className="bg-slate-700 hover:bg-slate-600 rounded-full p-3 border-4 border-slate-800 transition-all"
            >
              <ArrowDownUp className="text-blue-400" size={24} />
            </button>
          </div>

          {/* To Chain */}
          <div className="mb-6">
            <label className="text-sm text-blue-300 mb-2 block">To</label>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="w-full bg-transparent text-white text-lg mb-3 outline-none cursor-pointer"
              >
                {Object.entries(chains)
                  .filter(([key]) => key !== fromChain)
                  .map(([key, chain]) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {chain.name}
                    </option>
                  ))}
              </select>
              
              <div className="text-3xl text-white">
                {amount || '0.00'}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                You will receive (estimated)
              </div>
            </div>
          </div>

          {/* Fee Info */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-slate-900/30 rounded-lg p-4 mb-4 border border-slate-700/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Estimated Fee (USDC)</span>
                <span className="text-cyan-400">~{estimatedFee}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Bridge Route</span>
                <span className="text-white">{isLocalhost ? 'Local Swap' : 'Circle CCTP'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estimated Time</span>
                <span className="text-white">{isLocalhost ? 'Instant' : '~15 seconds'}</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapping || !isConnected}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              isSwapping || !isConnected
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin" size={20} />
                Processing...
              </span>
            ) : !isConnected ? (
              'Connect Wallet to Swap'
            ) : (
              'Swap'
            )}
          </button>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="text-sm text-green-400 mb-2">Transaction Submitted!</div>
              {isLocalhost ? (
                <div className="text-blue-400 text-sm font-mono break-all">
                  {txHash}
                </div>
              ) : (
                <a
                  href={`${currentChain?.explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                >
                  View on Explorer
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="text-cyan-400 font-semibold mb-2">⚡ Fast Finality</div>
            <div className="text-sm text-slate-300">Sub-second deterministic settlement</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="text-cyan-400 font-semibold mb-2">💰 USDC Gas</div>
            <div className="text-sm text-slate-300">Predictable fees in stablecoins</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="text-cyan-400 font-semibold mb-2">🌐 Multichain</div>
            <div className="text-sm text-slate-300">Powered by Circle CCTP</div>
          </div>
        </div>

        {/* Local Testing Info */}
        {isLocalhost && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm text-green-200">
              <strong>✅ Local Testing Mode Active:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Make sure Hardhat node is running: <code className="bg-slate-800 px-1 rounded">npm run chain</code></li>
                <li>Contracts should be deployed: <code className="bg-slate-800 px-1 rounded">npm run deploy:local</code></li>
                <li>Use the first Hardhat account in MetaMask</li>
                <li>Import the Hardhat private key into MetaMask for testing</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-12 text-center text-slate-400 text-sm">
        <p>Built on Arc Testnet • Powered by Circle CCTP • Using USDC as Gas</p>
        <div className="mt-2 flex justify-center gap-4">
          <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            Arc Docs
          </a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            Explorer
          </a>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            Faucet
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArcFX;
