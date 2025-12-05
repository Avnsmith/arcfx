const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to localhost...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy MockUSDC
  console.log("\nDeploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(deployer.address);
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("MockUSDC deployed to:", usdcAddress);

  // Deploy SwapBridge
  console.log("\nDeploying SwapBridge...");
  const SwapBridge = await ethers.getContractFactory("SwapBridge");
  const swapBridge = await SwapBridge.deploy(deployer.address);
  await swapBridge.waitForDeployment();
  const swapBridgeAddress = await swapBridge.getAddress();
  console.log("SwapBridge deployed to:", swapBridgeAddress);

  // Get USDC balance
  const usdcBalance = await mockUSDC.balanceOf(deployer.address);
  console.log("\nDeployer USDC balance:", ethers.formatUnits(usdcBalance, 6), "mUSDC");

  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDC Address:", usdcAddress);
  console.log("SwapBridge Address:", swapBridgeAddress);
  console.log("\nCopy these addresses to your .env.local file:");
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_SWAP_BRIDGE_ADDRESS=${swapBridgeAddress}`);
  console.log(`NEXT_PUBLIC_LOCAL_CHAIN_ID=31337`);
  console.log(`NEXT_PUBLIC_LOCAL_RPC=http://127.0.0.1:8545`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

