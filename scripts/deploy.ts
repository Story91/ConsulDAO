import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = hre;

// External contract addresses on Base Sepolia
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const POOL_MANAGER_BASE_SEPOLIA = "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408";

// Fundraiser configuration
const FUNDRAISER_GOAL = ethers.parseUnits("10000", 6); // 10,000 USDC (6 decimals)
const FUNDRAISER_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

// Initial mint: 10% of 100M max supply = 10M CONSUL
const INITIAL_MINT_AMOUNT = ethers.parseUnits("10000000", 18); // 10M tokens (18 decimals)

interface DeployedAddresses {
  consulToken: string;
  consulStaking: string;
  hubDAO: string;
  buyback: string;
  fundraiser: string;
  squads: string;
  projectRegistry: string;
  antiRugHook: string;
}

/** Small delay to let the RPC node's nonce cache catch up between txs */
const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const TX_DELAY = 3000; // 3 seconds between transactions

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const network = hre.network.name;

  console.log("=".repeat(60));
  console.log("ConsulDAO — Full Contract Deployment");
  console.log("=".repeat(60));
  console.log(`Network:  ${network}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployerAddress))} ETH`);
  console.log("=".repeat(60));
  console.log("");

  const addresses: DeployedAddresses = {
    consulToken: "",
    consulStaking: "",
    hubDAO: "",
    buyback: "",
    fundraiser: "",
    squads: "",
    projectRegistry: "",
    antiRugHook: "",
  };

  // ═══════════════════════════════════════════════════════════
  // Phase 1 — Deploy contracts with no inter-contract dependencies
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Phase 1 — Deploying independent contracts...\n");

  // 1. ConsulToken
  console.log("  [1/8] ConsulToken...");
  const ConsulToken = await ethers.getContractFactory("ConsulToken");
  const consulToken = await ConsulToken.deploy(deployerAddress);
  await consulToken.waitForDeployment();
  addresses.consulToken = await consulToken.getAddress();
  console.log(`    ✅ ConsulToken deployed to: ${addresses.consulToken}`);

  await delay(TX_DELAY);

  // 2. ProjectRegistry
  console.log("  [2/8] ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  addresses.projectRegistry = await projectRegistry.getAddress();
  console.log(`    ✅ ProjectRegistry deployed to: ${addresses.projectRegistry}`);

  await delay(TX_DELAY);

  // 3. Squads
  console.log("  [3/8] Squads...");
  const Squads = await ethers.getContractFactory("Squads");
  const squads = await Squads.deploy(deployerAddress);
  await squads.waitForDeployment();
  addresses.squads = await squads.getAddress();
  console.log(`    ✅ Squads deployed to: ${addresses.squads}`);

  await delay(TX_DELAY);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // Phase 2 — Deploy contracts that depend on Phase 1
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Phase 2 — Deploying dependent contracts...\n");

  // 4. ConsulStaking (needs ConsulToken)
  console.log("  [4/8] ConsulStaking...");
  const ConsulStaking = await ethers.getContractFactory("ConsulStaking");
  const consulStaking = await ConsulStaking.deploy(
    addresses.consulToken,
    deployerAddress
  );
  await consulStaking.waitForDeployment();
  addresses.consulStaking = await consulStaking.getAddress();
  console.log(`    ✅ ConsulStaking deployed to: ${addresses.consulStaking}`);

  await delay(TX_DELAY);

  // 5. HubDAO (needs USDC address)
  console.log("  [5/8] HubDAO...");
  const HubDAO = await ethers.getContractFactory("HubDAO");
  const hubDAO = await HubDAO.deploy(USDC_BASE_SEPOLIA, deployerAddress);
  await hubDAO.waitForDeployment();
  addresses.hubDAO = await hubDAO.getAddress();
  console.log(`    ✅ HubDAO deployed to: ${addresses.hubDAO}`);

  await delay(TX_DELAY);

  // 6. Buyback (needs USDC, ConsulToken, HubDAO)
  console.log("  [6/8] Buyback...");
  const Buyback = await ethers.getContractFactory("Buyback");
  const buyback = await Buyback.deploy(
    USDC_BASE_SEPOLIA,
    addresses.consulToken,
    addresses.hubDAO,
    deployerAddress
  );
  await buyback.waitForDeployment();
  addresses.buyback = await buyback.getAddress();
  console.log(`    ✅ Buyback deployed to: ${addresses.buyback}`);

  await delay(TX_DELAY);

  // 7. Fundraiser (needs owner, treasury=HubDAO, USDC, goal, duration)
  console.log("  [7/8] Fundraiser...");
  const Fundraiser = await ethers.getContractFactory("Fundraiser");
  const fundraiser = await Fundraiser.deploy(
    deployerAddress,
    addresses.hubDAO,
    USDC_BASE_SEPOLIA,
    FUNDRAISER_GOAL,
    FUNDRAISER_DURATION
  );
  await fundraiser.waitForDeployment();
  addresses.fundraiser = await fundraiser.getAddress();
  console.log(`    ✅ Fundraiser deployed to: ${addresses.fundraiser}`);

  await delay(TX_DELAY);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // Phase 3 — Deploy special contracts
  // ═══════════════════════════════════════════════════════════
  console.log("📦 Phase 3 — Deploying special contracts...\n");

  // 8. AntiRugHook (needs PoolManager)
  // Note: Uniswap v4 hooks require CREATE2 with mined salt for address bits.
  // For hackathon MVP, deploying normally with this limitation noted.
  console.log("  [8/8] AntiRugHook...");
  try {
    const AntiRugHook = await ethers.getContractFactory("AntiRugHook");
    const antiRugHook = await AntiRugHook.deploy(POOL_MANAGER_BASE_SEPOLIA);
    await antiRugHook.waitForDeployment();
    addresses.antiRugHook = await antiRugHook.getAddress();
    console.log(`    ✅ AntiRugHook deployed to: ${addresses.antiRugHook}`);
    console.log("    ⚠️  Note: Hook address bits may not match v4 permissions (hackathon MVP)");
  } catch (error) {
    console.log("    ⚠️  AntiRugHook deployment failed (expected if PoolManager rejects address bits)");
    console.log(`    Error: ${error instanceof Error ? error.message : String(error)}`);
    addresses.antiRugHook = "DEPLOYMENT_FAILED";
  }

  await delay(TX_DELAY);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // Phase 4 — Post-deploy wiring
  // ═══════════════════════════════════════════════════════════
  console.log("🔗 Phase 4 — Wiring contracts together...\n");

  // HubDAO.setStakingContract(ConsulStaking)
  console.log("  Setting HubDAO.stakingContract → ConsulStaking...");
  const hubDAOContract = await ethers.getContractAt("HubDAO", addresses.hubDAO);
  let tx = await hubDAOContract.setStakingContract(addresses.consulStaking);
  await tx.wait();
  console.log("    ✅ Done");

  await delay(TX_DELAY);

  // HubDAO.setBuybackContract(Buyback)
  console.log("  Setting HubDAO.buybackContract → Buyback...");
  tx = await hubDAOContract.setBuybackContract(addresses.buyback);
  await tx.wait();
  console.log("    ✅ Done");

  await delay(TX_DELAY);

  // HubDAO.setSquadsContract(Squads)
  console.log("  Setting HubDAO.squadsContract → Squads...");
  tx = await hubDAOContract.setSquadsContract(addresses.squads);
  await tx.wait();
  console.log("    ✅ Done");

  await delay(TX_DELAY);

  // Squads.setHubDao(HubDAO)
  console.log("  Setting Squads.hubDao → HubDAO...");
  const squadsContract = await ethers.getContractAt("Squads", addresses.squads);
  tx = await squadsContract.setHubDao(addresses.hubDAO);
  await tx.wait();
  console.log("    ✅ Done");

  await delay(TX_DELAY);

  // ConsulToken.initialMint(deployer, 10M CONSUL)
  console.log(`  Minting initial supply (10M CONSUL) to deployer...`);
  const consulTokenContract = await ethers.getContractAt("ConsulToken", addresses.consulToken);
  tx = await consulTokenContract.initialMint(deployerAddress, INITIAL_MINT_AMOUNT);
  await tx.wait();
  console.log("    ✅ Done");

  console.log("");

  // ═══════════════════════════════════════════════════════════
  // Phase 5 — Output
  // ═══════════════════════════════════════════════════════════
  console.log("=".repeat(60));
  console.log("📋 Deployment Summary");
  console.log("=".repeat(60));
  console.log("");
  console.log("Contract Addresses:");
  console.log(`  ConsulToken:     ${addresses.consulToken}`);
  console.log(`  ConsulStaking:   ${addresses.consulStaking}`);
  console.log(`  HubDAO:          ${addresses.hubDAO}`);
  console.log(`  Buyback:         ${addresses.buyback}`);
  console.log(`  Fundraiser:      ${addresses.fundraiser}`);
  console.log(`  Squads:          ${addresses.squads}`);
  console.log(`  ProjectRegistry: ${addresses.projectRegistry}`);
  console.log(`  AntiRugHook:     ${addresses.antiRugHook}`);
  console.log("");

  // Save .env format
  const envContent = [
    `# ConsulDAO Deployed Addresses (${network}) — ${new Date().toISOString()}`,
    `NEXT_PUBLIC_CONSUL_TOKEN_ADDRESS=${addresses.consulToken}`,
    `NEXT_PUBLIC_CONSUL_STAKING_ADDRESS=${addresses.consulStaking}`,
    `NEXT_PUBLIC_HUB_DAO_ADDRESS=${addresses.hubDAO}`,
    `NEXT_PUBLIC_BUYBACK_ADDRESS=${addresses.buyback}`,
    `NEXT_PUBLIC_FUNDRAISER_ADDRESS=${addresses.fundraiser}`,
    `NEXT_PUBLIC_SQUADS_ADDRESS=${addresses.squads}`,
    `NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS=${addresses.projectRegistry}`,
    `NEXT_PUBLIC_ANTI_RUG_HOOK_ADDRESS=${addresses.antiRugHook}`,
  ].join("\n");

  console.log("Add these to your .env file:");
  console.log("─".repeat(60));
  console.log(envContent);
  console.log("─".repeat(60));
  console.log("");

  // Save deployed-addresses.ts
  const tsContent = `// Auto-generated by deploy.ts — ${new Date().toISOString()}
// Network: ${network}
// Deployer: ${deployerAddress}

import { type Address } from "viem";

export const DEPLOYED_ADDRESSES = {
  consulToken: "${addresses.consulToken}" as Address,
  consulStaking: "${addresses.consulStaking}" as Address,
  hubDAO: "${addresses.hubDAO}" as Address,
  buyback: "${addresses.buyback}" as Address,
  fundraiser: "${addresses.fundraiser}" as Address,
  squads: "${addresses.squads}" as Address,
  projectRegistry: "${addresses.projectRegistry}" as Address,
  antiRugHook: "${addresses.antiRugHook}" as Address,
} as const;

// External contract addresses
export const EXTERNAL_ADDRESSES = {
  usdc: "${USDC_BASE_SEPOLIA}" as Address,
  poolManager: "${POOL_MANAGER_BASE_SEPOLIA}" as Address,
} as const;

// Constructor arguments (for verification)
export const CONSTRUCTOR_ARGS = {
  consulToken: ["${deployerAddress}"],
  consulStaking: ["${addresses.consulToken}", "${deployerAddress}"],
  hubDAO: ["${USDC_BASE_SEPOLIA}", "${deployerAddress}"],
  buyback: ["${USDC_BASE_SEPOLIA}", "${addresses.consulToken}", "${addresses.hubDAO}", "${deployerAddress}"],
  fundraiser: ["${deployerAddress}", "${addresses.hubDAO}", "${USDC_BASE_SEPOLIA}", "${FUNDRAISER_GOAL.toString()}", "${FUNDRAISER_DURATION}"],
  squads: ["${deployerAddress}"],
  projectRegistry: [],
  antiRugHook: ["${POOL_MANAGER_BASE_SEPOLIA}"],
} as const;
`;

  const deployedAddressesPath = path.join(__dirname, "..", "lib", "deployed-addresses.ts");
  fs.writeFileSync(deployedAddressesPath, tsContent);
  console.log(`✅ Saved deployed addresses to: lib/deployed-addresses.ts`);

  // Save constructor args JSON (for verification script)
  const argsJsonPath = path.join(__dirname, "..", "deployment-args.json");
  const argsJson = {
    network,
    deployer: deployerAddress,
    timestamp: new Date().toISOString(),
    addresses,
    constructorArgs: {
      consulToken: [deployerAddress],
      consulStaking: [addresses.consulToken, deployerAddress],
      hubDAO: [USDC_BASE_SEPOLIA, deployerAddress],
      buyback: [USDC_BASE_SEPOLIA, addresses.consulToken, addresses.hubDAO, deployerAddress],
      fundraiser: [deployerAddress, addresses.hubDAO, USDC_BASE_SEPOLIA, FUNDRAISER_GOAL.toString(), FUNDRAISER_DURATION.toString()],
      squads: [deployerAddress],
      projectRegistry: [],
      antiRugHook: [POOL_MANAGER_BASE_SEPOLIA],
    },
  };
  fs.writeFileSync(argsJsonPath, JSON.stringify(argsJson, null, 2));
  console.log(`✅ Saved constructor args to: deployment-args.json`);

  console.log("");
  console.log("🎉 Deployment complete!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Copy the .env variables above into your .env file");
  console.log("  2. Run verification: npx hardhat run scripts/verify.ts --network baseSepolia");
  console.log("  3. Register consul.eth on Sepolia ENS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
