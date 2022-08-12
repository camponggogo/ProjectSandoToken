const { getImplementationAddress } = require("@openzeppelin/upgrades-core");
const { ethers, upgrades, network } = require("hardhat");
const json = require("../config/rinkeby.json");

async function main() {
  const Locker = await ethers.getContractFactory("SANDOLockerV1");
  const locker = await upgrades.deployProxy(Locker, [json.sandoToken]);

  await locker.deployed();

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
