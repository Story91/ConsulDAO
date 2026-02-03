import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying ProjectRegistry to Base Sepolia...");

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const registry = await ProjectRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`✅ ProjectRegistry deployed to: ${address}`);
  console.log("");
  console.log("Add this to your .env file:");
  console.log(`NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS=${address}`);
  console.log("");
  console.log("Verify on BaseScan:");
  console.log(`npx hardhat verify --network baseSepolia ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

