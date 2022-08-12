const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers, upgrades } = require("hardhat");

let TokenFactory,
  LaunchpadFactory,
  sandoToken,
  usdcToken,
  launchpadContract,
  owner,
  addr1,
  addr2;

beforeEach(async () => {
  TokenFactory = await ethers.getContractFactory("Token");
  LaunchpadFactory = await ethers.getContractFactory("SANDOLaunchpad");

  [owner, addr1, addr2] = await ethers.getSigners();

  sandoToken = await TokenFactory.deploy("SANDO", "SANDO");
  usdcToken = await TokenFactory.deploy("USDC", "USDC");
  launchpadContract = await LaunchpadFactory.deploy(
    sandoToken.address,
    usdcToken.address
  );
});

describe("Mint Success", () => {
  it("Should mint sando success", async () => {
    const sandoBalance = await sandoToken.balanceOf(owner.address);

    expect(await sandoToken.totalSupply()).to.equal(sandoBalance);
  });

  it("Should mint usdc success", async () => {
    const usdcBalance = await usdcToken.balanceOf(owner.address);

    expect(await usdcToken.totalSupply()).to.equal(usdcBalance);
  });
});

describe("Setting launchpad", () => {
  it("Should transfer sando to launchpad", async () => {
    const transferAmount = parseEther(100000 + "");
    let launchpadBalance = await sandoToken.balanceOf(
      launchpadContract.address
    );

    expect(launchpadBalance).to.equal(0);

    await sandoToken.transfer(launchpadContract.address, transferAmount);

    launchpadBalance = await sandoToken.balanceOf(launchpadContract.address);

    expect(launchpadBalance.toNumber()).to.equal(transferAmount);
  });
});
