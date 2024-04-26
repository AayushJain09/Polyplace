const fs = require('fs');
require('dotenv').config();
require('@nomiclabs/hardhat-waffle');

// const privateKey = fs.readFileSync('.secret').toString().trim();
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    hardhat: {
      chainId: 11155111,
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/63D8xMT7bh0uQybtkfOzlEHWQ39vB2Wz',
      accounts: [privateKey],
    },
  },
  solidity: '0.8.4',
};
