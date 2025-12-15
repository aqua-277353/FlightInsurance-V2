// scripts/deploy-final.js
const { ethers } = require("hardhat");

async function main() {
  // 1. Deploy Token
  const FlightCoin = await ethers.getContractFactory("FlightCoin");
  const token = await FlightCoin.deploy();
  await token.waitForDeployment();
  console.log("TOKEN_ADDRESS:", await token.getAddress());

  // 2. Deploy Insurance
  const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
  const insurance = await FlightInsurance.deploy(await token.getAddress());
  await insurance.waitForDeployment();
  console.log("INSURANCE_ADDRESS:", await insurance.getAddress());
}

main().catch((error) => { console.error(error); process.exit(1); });