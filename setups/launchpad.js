const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

const json = require("../config/rinkeby.json");
const { utils } = require("ethers");

const convertTime = (amount, unit) => {
  return dayjs.duration(amount, unit).asSeconds();
};

const currentType = "seed";

const sellType = [
  {
    _locker: "seed",
    _tokenRate: 900000000000000, // 0.0009 USD
    _timeLock: convertTime(5, "minutes"),
    _isLock: true,
  },
  {
    _locker: "private sale",
    _tokenRate: 1200000000000000, // 0.0012 USD
    _timeLock: convertTime(5, "minutes"),
    _isLock: true,
  },
  {
    _locker: "ico sale",
    _tokenRate: 2000000000000000, // 0.002 USD
    _timeLock: convertTime(5, "minutes"),
    _isLock: false,
  },
];

async function main() {
  const {
    launchpad: LaunchpadAddress,
    sandoToken: SANDOTokenAddress,
    locker: LockerAddress,
    brokerAddress: BrokerAddress,
  } = json;
  const Launchpad = await ethers.getContractFactory("SANDOLaunchpadV1");
  const Locker = await ethers.getContractFactory("SANDOLockerV1");

  const LockerInstance = Locker.attach(LockerAddress);

  const LaunchpadInstance = Launchpad.attach(LaunchpadAddress);

  for (const type of sellType) {
    const tx = await LockerInstance.setLockerType(
      type._locker,
      type._timeLock,
      type._isLock
    );

    await tx.wait();
  }

  for (const type of sellType) {
    const tx = await LaunchpadInstance.setSellType(
      type._locker,
      type._tokenRate
    );

    await tx.wait();
  }

  await LaunchpadInstance.setCurrentSellType(currentType);

  const Token = await ethers.getContractFactory("Token");
  const tokenInstance = Token.attach(SANDOTokenAddress);

  const transferAmount = 100000000;
  const tokenTx = await tokenInstance.transfer(
    LaunchpadAddress,
    parseEther(transferAmount.toString())
  );

  await tokenTx.wait(5);

  const LockerRole = utils.id("LOCKER_ROLE");
  const grantRole = await LockerInstance.grantRole(
    LockerRole,
    LaunchpadAddress
  );

  await grantRole.wait(5);

  const UnlockRole = utils.id("UNLOCK_ROLE");
  const _unlockRole = await LockerInstance.grantRole(UnlockRole, BrokerAddress);
  await _unlockRole.wait(5);

  const BrokerRole = utils.id("BROKER_ROLE");
  const _grantRole = await LaunchpadInstance.grantRole(
    BrokerRole,
    BrokerAddress
  );
  await _grantRole.wait(5);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
