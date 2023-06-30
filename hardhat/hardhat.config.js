require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",

  networks: {
    testnet_aurora: {
      url: 'https://aurora-testnet.infura.io/v3/7dcdeb180769458493744588542fabcd',
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 1313161555,
      gasPrice: 120 * 1000000000
    },
    // celo: {
    //   url: "https://forno.celo.org",
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC,
    //     path: "m/44'/52752'/0'/0",
    //   },
    //   chainId: 42220,
    // },
  },
};
