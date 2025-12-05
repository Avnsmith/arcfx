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

// Check if we're in development/localhost
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Official Arc Testnet contract addresses from https://docs.arc.network/arc/references/contract-addresses
const ARC_CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000', // USDC ERC-20 interface (6 decimals)
  EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', // EURC token contract (6 decimals)
};

const ArcFX = () => {
  const [fromChain, setFromChain] = useState('Arc_Testnet');
  const [toChain, setToChain] = useState('Ethereum_Sepolia');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'EURC'>('USDC');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [copied, setCopied] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState('0.01');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Chain configurations
  const allChains: Record<string, any> = {
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
      rpc: 'https://rpc.testnet.arc.network',
      explorer: 'https://testnet.arcscan.app',
      cctpDomain: 26,
      color: 'from-blue-500 to-cyan-500',
      // Official Arc Testnet contract addresses
      tokens: {
        USDC: ARC_CONTRACTS.USDC,
        EURC: ARC_CONTRACTS.EURC,
      },
      // Arc Testnet network details for MetaMask
      networkDetails: {
        chainId: '0x4CEA42', // 5042002 in hex
        chainName: 'Arc Testnet',
        nativeCurrency: {
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        rpcUrls: ['https://rpc.testnet.arc.network'],
        blockExplorerUrls: ['https://testnet.arcscan.app'],
      }
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

  // Filter chains based on environment (remove localhost in production)
  const chains = Object.fromEntries(
    Object.entries(allChains).filter(([key]) => 
      isDevelopment || key !== 'Localhost'
    )
  );

  // Get current token address for selected chain and token
  const getTokenAddress = (chain: string, token: 'USDC' | 'EURC'): string => {
    const chainConfig = chains[chain];
    if (!chainConfig) return '';

    // Arc Testnet has both tokens
    if (chain === 'Arc_Testnet' && chainConfig.tokens) {
      return chainConfig.tokens[token] || '';
    }

    // Other chains default to USDC
    return chainConfig.usdcAddress || chainConfig[`${token.toLowerCase()}Address`] || '';
  };

  // Check if localhost is configured
  useEffect(() => {
    setIsLocalhost(
      chains[fromChain]?.chainId === 31337 || 
      !!(process.env.NEXT_PUBLIC_USDC_ADDRESS && process.env.NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS)
    );
  }, [fromChain]);

  // Add Arc Testnet to MetaMask if not already added
  const addArcTestnetToMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const arcChain = allChains.Arc_Testnet;
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [arcChain.networkDetails],
      });
    } catch (error: any) {
      // Chain already added or user rejected
      if (error.code !== 4902) {
        console.error('Error adding Arc Testnet:', error);
      }
    }
  };

  // Switch to any network based on chain name
  const switchToNetwork = async (chainName: string) => {
    if (typeof window.ethereum === 'undefined') return false;

    const chainConfig = chains[chainName];
    if (!chainConfig || !chainConfig.chainId) return false;

    try {
      const chainIdHex = '0x' + chainConfig.chainId.toString(16);

      // Try to switch network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask, try to add it
      if (switchError.code === 4902) {
        try {
          // Add the chain first
          if (chainName === 'Arc_Testnet' && chainConfig.networkDetails) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig.networkDetails],
            });
            // Then switch to it
            await switchToNetwork(chainName);
            return true;
          } else if (chainName === 'Ethereum_Sepolia') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xAA36A7', // 11155111 in hex
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
            await switchToNetwork(chainName);
            return true;
          } else if (chainName === 'Polygon_Amoy') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13882', // 80002 in hex
                chainName: 'Polygon Amoy',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://www.oklink.com/amoy'],
              }],
            });
            await switchToNetwork(chainName);
            return true;
          }
        } catch (addError: any) {
          console.error(`Error adding ${chainName}:`, addError);
          return false;
        }
      } else {
        console.error(`Error switching to ${chainName}:`, switchError);
        return false;
      }
    }
    return false;
  };

  // Switch to Arc Testnet network (backward compatibility)
  const switchToArcTestnet = async () => {
    return await switchToNetwork('Arc_Testnet');
  };

  // Connect wallet and auto-detect/switch to Arc Testnet
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

        // Auto-switch to selected network
        const expectedChainId = chains[fromChain]?.chainId;
        if (expectedChainId) {
          try {
            // Switch to the correct network
            await switchToNetwork(fromChain);
            // Wait for network switch to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Refresh provider and signer after network switch
            const newProvider = new ethers.BrowserProvider(window.ethereum!);
            const newSigner = await newProvider.getSigner();
            setProvider(newProvider);
            setSigner(newSigner);
            // Wait a bit more for everything to settle
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error: any) {
            console.error('Network switch error:', error);
            // Continue even if switch fails
          }
        }

        // Check and switch network if needed (for localhost)
        if (isLocalhost) {
          await checkAndSwitchNetwork();
        }

        // Load balance automatically
        await loadBalance();
      } catch (error: any) {
        alert('Failed to connect wallet: ' + error.message);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  // Check and switch to localhost network (only for development)
  const checkAndSwitchNetwork = async () => {
    if (!provider || !isLocalhost || !isDevelopment) return;

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
    }
  };

  // Load token balance (USDC or EURC)
  const loadBalance = async () => {
    setBalanceLoading(true);
    setBalanceError(null);

    if (!signer) {
      console.error('No signer available');
      setBalanceError('Wallet not connected');
      setBalanceLoading(false);
      return;
    }

    const tokenAddress = getTokenAddress(fromChain, selectedToken);
    if (!tokenAddress) {
      console.error(`No token address found for chain: ${fromChain}, token: ${selectedToken}`);
      setBalanceError(`Token address not found for ${selectedToken}`);
      setBalance('0.00');
      setBalanceLoading(false);
      return;
    }

    try {
      // Verify we're on the correct network
      const network = await provider?.getNetwork();
      const expectedChainId = chains[fromChain]?.chainId;
      
      if (network && expectedChainId && network.chainId !== BigInt(expectedChainId)) {
        const errorMsg = `Please switch to ${chains[fromChain]?.name} (Chain ID: ${expectedChainId})`;
        console.warn(`Network mismatch! Expected chain ${expectedChainId}, but connected to ${network.chainId}`);
        setBalanceError(errorMsg);
        setBalance('0.00');
        setBalanceLoading(false);
        return;
      }

      console.log(`Loading ${selectedToken} balance from:`, tokenAddress);
      console.log(`Wallet address:`, walletAddress);
      console.log(`Network:`, network?.chainId);

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );

      // Get balance and decimals
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals()
      ]);

      setTokenDecimals(decimals);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      const balanceNumber = parseFloat(formattedBalance);
      
      console.log(`Balance loaded: ${balanceNumber} ${selectedToken}`);
      
      setBalance(balanceNumber.toFixed(2));
      setBalanceError(null);
    } catch (error: any) {
      console.error('Error loading balance:', error);
      console.error('Error details:', {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data
      });
      
      let errorMessage = 'Failed to load balance';
      
      // Show user-friendly error message
      if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = `Network error: Please make sure you're connected to ${chains[fromChain]?.name}`;
      } else if (error.reason) {
        errorMessage = `Contract error: ${error.reason}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setBalanceError(errorMessage);
      setBalance('0.00');
    } finally {
      setBalanceLoading(false);
    }
  };

  // Auto-switch network and load balance when chain or token changes
  useEffect(() => {
    if (!isConnected || !signer || !provider) return;

    const handleChainSwitch = async () => {
      try {
        // Get current network
        const currentNetwork = await provider.getNetwork();
        const expectedChainId = chains[fromChain]?.chainId;

        // Check if we need to switch networks
        if (currentNetwork && expectedChainId && currentNetwork.chainId !== BigInt(expectedChainId)) {
          console.log(`Switching to ${chains[fromChain]?.name} (Chain ID: ${expectedChainId})`);
          
          // Switch to the correct network
          const switched = await switchToNetwork(fromChain);
          
          if (switched) {
            // Wait for network switch to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Refresh provider and signer after network switch
            if (window.ethereum) {
              const newProvider = new ethers.BrowserProvider(window.ethereum);
              const newSigner = await newProvider.getSigner();
              setProvider(newProvider);
              setSigner(newSigner);
              
              // Wait a bit more for everything to settle
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Load balance after provider refresh
              const tokenAddress = getTokenAddress(fromChain, selectedToken);
              if (tokenAddress) {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, newSigner);
                const [balance, decimals] = await Promise.all([
                  tokenContract.balanceOf(walletAddress),
                  tokenContract.decimals()
                ]);
                const formattedBalance = ethers.formatUnits(balance, decimals);
                setBalance(parseFloat(formattedBalance).toFixed(2));
                setTokenDecimals(decimals);
              }
            }
          }
        } else {
          // Already on correct network, just load balance
          await loadBalance();
        }
      } catch (error: any) {
        console.error('Error in auto-switch:', error);
        // Try to load balance anyway (might work if already on correct network)
        loadBalance().catch(console.error);
      }
    };

    handleChainSwitch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromChain, selectedToken, isConnected, walletAddress]);

  // Listen for network changes and reload balance
  useEffect(() => {
    if (!isConnected || typeof window.ethereum === 'undefined') return;

    const handleNetworkChange = () => {
      console.log('Network changed, reloading balance...');
      // Refresh provider and signer
      const newProvider = new ethers.BrowserProvider(window.ethereum!);
      newProvider.getSigner().then(async (newSigner) => {
        setProvider(newProvider);
        setSigner(newSigner);
        // Wait a bit then reload balance
        await new Promise(resolve => setTimeout(resolve, 500));
        loadBalance().catch(console.error);
      });
    };

    // Listen for chainChanged event (MetaMask supports event listeners)
    if (window.ethereum && 'on' in window.ethereum) {
      (window.ethereum as any).on('chainChanged', handleNetworkChange);
      (window.ethereum as any).on('accountsChanged', handleNetworkChange);

      return () => {
        if (window.ethereum && 'removeListener' in window.ethereum) {
          (window.ethereum as any).removeListener('chainChanged', handleNetworkChange);
          (window.ethereum as any).removeListener('accountsChanged', handleNetworkChange);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, fromChain, selectedToken]);

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
  }, [amount, isLocalhost, signer, selectedToken]);

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
      const amountWei = ethers.parseUnits(amount, tokenDecimals);
      const fee = (amountWei * feeBps) / BigInt(10000);
      
      setEstimatedFee(ethers.formatUnits(fee, tokenDecimals));
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

    if (isLocalhost && (!signer || !getTokenAddress(fromChain, selectedToken) || !chains[fromChain]?.swapBridgeAddress)) {
      alert('Localhost contracts not configured. Please set NEXT_PUBLIC_USDC_ADDRESS and NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS in .env.local');
      return;
    }

    // For production/testnet, show demo message
    if (!isLocalhost) {
      alert('This is a demo interface. Smart contracts need to be deployed to testnet for real transactions.');
      return;
    }

    setIsSwapping(true);
    
    try {
      const tokenAddress = getTokenAddress(fromChain, selectedToken);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );

      const swapBridgeContract = new ethers.Contract(
        chains[fromChain].swapBridgeAddress,
        SWAP_BRIDGE_ABI,
        signer
      );

      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount, tokenDecimals);

      // Check allowance
      const allowance = await tokenContract.allowance(
        walletAddress,
        chains[fromChain].swapBridgeAddress
      );

      // Approve if needed
      if (allowance < amountWei) {
        console.log(`Approving ${selectedToken}...`);
        const approveTx = await tokenContract.approve(
          chains[fromChain].swapBridgeAddress,
          ethers.MaxUint256
        );
        await approveTx.wait();
        console.log('Approval confirmed');
      }

      // Execute swap
      console.log('Executing swap...');
      const swapTx = await swapBridgeContract.swap(
        tokenAddress,
        amountWei,
        chains[toChain]?.chainId || 31337
      );

      const receipt = await swapTx.wait();
      
      setTxHash(receipt.hash);
      
      // Refresh balance
      await loadBalance();

      alert(`Success! Swap transaction confirmed.\nFrom: ${chains[fromChain].name}\nTo: ${chains[toChain].name}\nAmount: ${amount} ${selectedToken}\nTx: ${receipt.hash}`);
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
  const tokenAddress = getTokenAddress(fromChain, selectedToken);
  const isArcTestnet = fromChain === 'Arc_Testnet';

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
                {balanceLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={14} />
                    Loading balance...
                  </span>
                ) : (
                  <>
                    Balance: {balance} {selectedToken}
                    {balanceError && (
                      <div className="text-xs text-red-400 mt-1">
                        {balanceError}
                      </div>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={loadBalance}
                disabled={balanceLoading}
                className={`text-xs mt-1 flex items-center gap-1 transition-colors ${
                  balanceLoading
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                <RefreshCw className={balanceLoading ? 'animate-spin' : ''} size={12} />
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
                  <strong>Arc Testnet Auto-Detection:</strong> When you connect your wallet, Arc Testnet will be automatically added to MetaMask if not already configured. 
                  Supports both <strong>USDC</strong> and <strong>EURC</strong> tokens. Gas fees are paid in USDC for predictable costs (~$0.01 per transaction).
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
          
          {/* Token Selection (only for Arc Testnet) */}
          {isArcTestnet && (
            <div className="mb-4">
              <label className="text-sm text-blue-300 mb-2 block">Select Token</label>
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedToken('USDC')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedToken === 'USDC'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    USDC
                  </button>
                  <button
                    onClick={() => setSelectedToken('EURC')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedToken === 'EURC'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    EURC
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {selectedToken === 'USDC' 
                    ? 'USDC Address: 0x3600...0000' 
                    : 'EURC Address: 0x89B5...D72a'}
                </div>
              </div>
            </div>
          )}
          
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
                Available: {balance} {selectedToken}
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
                <span className="text-slate-400">Estimated Fee ({selectedToken})</span>
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
            <div className="text-cyan-400 font-semibold mb-2">💰 USDC & EURC</div>
            <div className="text-sm text-slate-300">Support for multiple stablecoins</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
            <div className="text-cyan-400 font-semibold mb-2">🌐 Multichain</div>
            <div className="text-sm text-slate-300">Powered by Circle CCTP</div>
          </div>
        </div>

        {/* Contract Addresses Info */}
        {isArcTestnet && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm text-blue-100">
              <strong>📋 Official Arc Testnet Contracts:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                <li>
                  <strong>USDC:</strong> <code className="bg-slate-800 px-1 rounded">0x3600000000000000000000000000000000000000</code>
                  <a href={`${chains.Arc_Testnet.explorer}/address/${ARC_CONTRACTS.USDC}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-2">
                    View ↗
                  </a>
                </li>
                <li>
                  <strong>EURC:</strong> <code className="bg-slate-800 px-1 rounded">0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a</code>
                  <a href={`${chains.Arc_Testnet.explorer}/address/${ARC_CONTRACTS.EURC}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-2">
                    View ↗
                  </a>
                </li>
              </ul>
              <div className="mt-2 text-xs text-slate-400">
                Source: <a href="https://docs.arc.network/arc/references/contract-addresses" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Arc Network Documentation</a>
              </div>
            </div>
          </div>
        )}

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
