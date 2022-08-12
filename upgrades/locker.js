const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { ethers, upgrades, network } = require("hardhat");
const json = require("../config/rinkeby.json");

async function main() {
  const LockerV2 = await ethers.getContractFactory("SANDOLockerV2");

  const locker = await upgrades.upgradeProxy(json.locker, LockerV2);

  console.log("Locker deployed to:", locker.address);

  const provider = network.provider;
  const currentImplAddress = await getImplementationAddress(
    provider,
    locker.address
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
