import hre from "hardhat";

const { ethers } = hre;

async function main(): Promise<void> {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("=".repeat(50));
  console.log("Sepolia Balance Check");
  console.log("=".repeat(50));
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Address:  ${address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  console.log("=".repeat(50));
  
  if (balance === BigInt(0)) {
    console.log("\n⚠️  You need Sepolia ETH for ENS operations!");
    console.log("\nFaucets:");
    console.log("  - https://sepoliafaucet.com/ (Alchemy)");
    console.log("  - https://www.infura.io/faucet/sepolia (Infura)");
    console.log("  - https://sepolia-faucet.pk910.de/ (PoW - no limit)");
  } else {
    console.log("\n✅ You have Sepolia ETH! Ready for ENS testing.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

