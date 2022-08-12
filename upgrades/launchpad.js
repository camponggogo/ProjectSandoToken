const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { ethers, upgrades, network } = require("hardhat");
const json = require("../config/rinkeby.json");

async function main() {
  const LaunchpadV2 = await ethers.getContractFactory("SANDOLaunchpadV3");

  const launchpad = await upgrades.upgradeProxy(json.launchpad, LaunchpadV2);

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
