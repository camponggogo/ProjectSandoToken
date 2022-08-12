const { ethers, run } = require("hardhat");

async function main() {
  const tokenList = [
    {
      name: "SANDO Token",
      symbol: "SANDO",
    },
    {
      name: "USDC Token",
      symbol: "USDC",
    },
  ];
  const Token = await ethers.getContractFactory("Token");

  for (const iterator of tokenList) {
    const token = await Token.deploy(iterator.name, iterator.symbol);

    const tx = await token.deployed();

    console.log(`${iterator.name} deployed to:`, token.address);

    await tx.deployTransaction.wait(6);

    // await run("verify:verify", {
    //   address: token.address,
    //   constructorArguments: [iterator.name, iterator.symbol],
    // });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
