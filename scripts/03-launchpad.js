const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { ethers, upgrades, network } = require("hardhat");
const json = require("../config/rinkeby.json");

async function main() {
  const Launchpad = await ethers.getContractFactory("SANDOLaunchpadV1");
  const launchpad = await upgrades.deployProxy(Launchpad, [
    json.sandoToken,
    json.usdcToken,
    json.locker,
  ]);

  await launchpad.deployed();

  console.log("Launchpad deployed to:", launchpad.address);

  const provider = network.provider;
  const currentImplAddress = await getImplementationAddress(
    provider,
    launchpad.address
  );

  await run("verify:verify", {
    address: currentImplAddress,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
