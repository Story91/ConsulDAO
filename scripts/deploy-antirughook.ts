import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

const { ethers } = hre;

// Uniswap v4 PoolManager on Base Sepolia
const POOL_MANAGER = "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408";

// Required permission bits for AntiRugHook:
// afterInitialize = 1 << 12 = 0x1000
// beforeSwap      = 1 << 7  = 0x0080
// Combined:                   0x1080
const REQUIRED_FLAGS = BigInt(0x1080);

// Bits that must NOT be set (all other hook permission flags):
// beforeInitialize    = 1 << 13 = 0x2000
// beforeAddLiquidity  = 1 << 11 = 0x0800
// afterAddLiquidity   = 1 << 10 = 0x0400
// beforeRemoveLiq     = 1 << 9  = 0x0200
// afterRemoveLiq      = 1 << 8  = 0x0100
// afterSwap           = 1 << 6  = 0x0040
// beforeDonate        = 1 << 5  = 0x0020
// afterDonate         = 1 << 4  = 0x0010
// beforeSwapRetDelta  = 1 << 3  = 0x0008
// afterSwapRetDelta   = 1 << 2  = 0x0004
// afterAddLiqRetDelta = 1 << 1  = 0x0002
// afterRemLiqRetDelta = 1 << 0  = 0x0001
const FORBIDDEN_FLAGS = BigInt(0x2F7F) & ~REQUIRED_FLAGS; // all 14 flag bits except required ones

function checkAddress(addr: bigint): boolean {
  const low14 = addr & BigInt(0x3FFF); // lower 14 bits
  // Required bits must be set, forbidden bits must NOT be set
  return (low14 & REQUIRED_FLAGS) === REQUIRED_FLAGS && (low14 & FORBIDDEN_FLAGS) === BigInt(0);
}

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("=".repeat(60));
  console.log("AntiRugHook — CREATE2 Deployment");
  console.log("=".repeat(60));
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Deployer: ${deployerAddress}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployerAddress))} ETH`);
  console.log(`Required address flags: 0x${REQUIRED_FLAGS.toString(16)}`);
  console.log("=".repeat(60));
  console.log("");

  // Step 1: Deploy HookDeployer factory
  console.log("📦 Step 1 — Deploying CREATE2 factory...");
  const HookDeployer = await ethers.getContractFactory("HookDeployer");
  const factory = await HookDeployer.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`  ✅ HookDeployer factory at: ${factoryAddress}\n`);

  // Step 2: Build AntiRugHook creation code
  console.log("🔨 Step 2 — Building AntiRugHook creation code...");
  const AntiRugHook = await ethers.getContractFactory("AntiRugHook");
  const creationCode = ethers.solidityPacked(
    ["bytes", "bytes"],
    [AntiRugHook.bytecode, ethers.AbiCoder.defaultAbiCoder().encode(["address"], [POOL_MANAGER])]
  );
  const codeHash = ethers.keccak256(creationCode);
  console.log(`  Creation code hash: ${codeHash}`);
  console.log(`  Creation code size: ${creationCode.length / 2 - 1} bytes\n`);

  // Step 3: Mine salt
  console.log("⛏️  Step 3 — Mining salt for correct address bits...");
  console.log(`  Looking for address with bits 0x${REQUIRED_FLAGS.toString(16)} set (afterInitialize + beforeSwap)`);

  let salt = BigInt(0);
  let foundAddress = "";
  const startTime = Date.now();
  const batchSize = 1000;

  for (let batch = 0; ; batch++) {
    for (let i = 0; i < batchSize; i++) {
      const saltHex = ethers.zeroPadValue(ethers.toBeHex(salt), 32);

      // Compute CREATE2 address off-chain
      const addr = BigInt(
        ethers.getCreate2Address(factoryAddress, saltHex, codeHash)
      );

      if (checkAddress(addr)) {
        foundAddress = ethers.getAddress(ethers.toBeHex(addr, 20));
        console.log(`\n  ✅ Found valid salt after ${salt} attempts!`);
        console.log(`  Salt:    ${saltHex}`);
        console.log(`  Address: ${foundAddress}`);
        console.log(`  Bits:    0x${(addr & BigInt(0x3FFF)).toString(16)}`);
        console.log(`  Time:    ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
        break;
      }
      salt++;
    }

    if (foundAddress) break;

    if (batch % 100 === 0 && batch > 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ... tried ${salt} salts (${elapsed}s elapsed)`);
    }

    // Safety: stop after 10M attempts
    if (salt > BigInt(10_000_000)) {
      console.error("  ❌ Could not find valid salt after 10M attempts");
      process.exitCode = 1;
      return;
    }
  }

  // Step 4: Deploy via CREATE2
  console.log("🚀 Step 4 — Deploying AntiRugHook via CREATE2...");
  const saltHex = ethers.zeroPadValue(ethers.toBeHex(salt), 32);
  const tx = await factory.deploy(saltHex, creationCode);
  const receipt = await tx.wait();
  console.log(`  ✅ AntiRugHook deployed to: ${foundAddress}`);
  console.log(`  Tx hash: ${receipt?.hash}\n`);

  // Step 5: Verify hook address bits
  console.log("🔍 Step 5 — Verifying hook permissions...");
  const addrBigInt = BigInt(foundAddress);
  const afterInit = (addrBigInt & BigInt(1 << 12)) !== BigInt(0);
  const beforeSwap = (addrBigInt & BigInt(1 << 7)) !== BigInt(0);
  console.log(`  afterInitialize bit:  ${afterInit ? "✅" : "❌"}`);
  console.log(`  beforeSwap bit:       ${beforeSwap ? "✅" : "❌"}`);

  if (!afterInit || !beforeSwap) {
    console.error("  ❌ Address bits don't match — something went wrong!");
    process.exitCode = 1;
    return;
  }

  // Try to read owner (may fail if RPC hasn't indexed yet)
  console.log("  Waiting for RPC to index contract...");
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const hook = await ethers.getContractAt("AntiRugHook", foundAddress);
    const hookOwner = await hook.owner();
    console.log(`  Owner: ${hookOwner}`);
    if (hookOwner.toLowerCase() !== deployerAddress.toLowerCase()) {
      console.log(`  ⚠️  Owner is factory (${hookOwner}), not deployer.`);
      console.log("  Note: For hackathon demo, the hook is deployed and functional.");
    } else {
      console.log(`  ✅ Owner is deployer: ${deployerAddress}`);
    }
  } catch {
    console.log("  ⚠️  Could not read owner() yet — RPC may still be indexing.");
    console.log("  The contract IS deployed (tx confirmed). Verify on BaseScan.");
  }
  console.log("");

  // Step 7: Update files
  console.log("📝 Step 7 — Updating deployment files...");

  // Update deployment-args.json
  const argsPath = path.join(__dirname, "..", "deployment-args.json");
  if (fs.existsSync(argsPath)) {
    const data = JSON.parse(fs.readFileSync(argsPath, "utf-8"));
    data.addresses.antiRugHook = foundAddress;
    data.constructorArgs.antiRugHook = [POOL_MANAGER];
    data.antiRugHookFactory = factoryAddress;
    data.antiRugHookSalt = saltHex;
    fs.writeFileSync(argsPath, JSON.stringify(data, null, 2));
    console.log("  ✅ Updated deployment-args.json");
  }

  // Update deployed-addresses.ts
  const addrTsPath = path.join(__dirname, "..", "lib", "deployed-addresses.ts");
  if (fs.existsSync(addrTsPath)) {
    let content = fs.readFileSync(addrTsPath, "utf-8");
    content = content.replace(
      /antiRugHook: ".*?" as Address/,
      `antiRugHook: "${foundAddress}" as Address`
    );
    fs.writeFileSync(addrTsPath, content);
    console.log("  ✅ Updated lib/deployed-addresses.ts");
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("🎉 AntiRugHook deployed successfully!");
  console.log("=".repeat(60));
  console.log(`  Address: ${foundAddress}`);
  console.log(`  Factory: ${factoryAddress}`);
  console.log(`  Salt:    ${saltHex}`);
  console.log("");
  console.log("Update your .env:");
  console.log(`  NEXT_PUBLIC_ANTI_RUG_HOOK_ADDRESS=${foundAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

