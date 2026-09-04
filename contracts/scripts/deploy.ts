import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying EvidenceRegistry to local Hardhat node...");

  const EvidenceRegistry = await ethers.getContractFactory("EvidenceRegistry");
  const registry = await EvidenceRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`\n✅ EvidenceRegistry deployed to: ${address}`);

  // Save address to a file so the web app can pick it up
  const deployInfo = {
    contractAddress: address,
    network: "localhost",
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../deployments/localhost.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log(`📄 Deployment info saved to contracts/deployments/localhost.json`);
  console.log(`\n🔧 Add this to apps/web/.env.local:`);
  console.log(`   CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
