import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface DeploymentArgs {
  network: string;
  deployer: string;
  timestamp: string;
  addresses: Record<string, string>;
  constructorArgs: Record<string, string[]>;
}

async function main(): Promise<void> {
  const argsPath = path.join(__dirname, "..", "deployment-args.json");

  if (!fs.existsSync(argsPath)) {
    console.error("❌ deployment-args.json not found. Run deploy.ts first.");
    process.exitCode = 1;
    return;
  }

  const data: DeploymentArgs = JSON.parse(fs.readFileSync(argsPath, "utf-8"));
  const network = hre.network.name;

  console.log("=".repeat(60));
  console.log("ConsulDAO — Contract Verification on BaseScan");
  console.log("=".repeat(60));
  console.log(`Network:      ${network}`);
  console.log(`Deploy data:  ${data.network} (${data.timestamp})`);
  console.log(`Deployer:     ${data.deployer}`);
  console.log("=".repeat(60));
  console.log("");

  if (network !== data.network) {
    console.warn(`⚠️  Current network (${network}) differs from deployment network (${data.network})`);
    console.warn("   Continuing anyway — make sure this is intentional.\n");
  }

  const contracts = [
    "consulToken",
    "consulStaking",
    "hubDAO",
    "buyback",
    "fundraiser",
    "squads",
    "projectRegistry",
    "antiRugHook",
  ] as const;

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const name of contracts) {
    const address = data.addresses[name];
    const args = data.constructorArgs[name] ?? [];

    if (!address || address === "DEPLOYMENT_FAILED") {
      console.log(`  ⏭️  Skipping ${name} (not deployed)`);
      skipCount++;
      continue;
    }

    console.log(`  🔍 Verifying ${name} at ${address}...`);
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: args,
      });
      console.log(`    ✅ ${name} verified`);
      successCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Already Verified") || message.includes("already verified")) {
        console.log(`    ✅ ${name} already verified`);
        successCount++;
      } else {
        console.log(`    ❌ ${name} verification failed: ${message}`);
        failCount++;
      }
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("Verification Summary");
  console.log("=".repeat(60));
  console.log(`  ✅ Verified:  ${successCount}`);
  console.log(`  ❌ Failed:    ${failCount}`);
  console.log(`  ⏭️  Skipped:  ${skipCount}`);
  console.log("");

  if (failCount > 0) {
    console.log("Tip: If verification failed, try running again after a few minutes.");
    console.log("     BaseScan sometimes needs time to index new contracts.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

