import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-spdx-license-identifier';

const config: HardhatUserConfig = {
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true
  },
  solidity: {
    version: '0.6.10'
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
      }
    }
  },
  paths: {
    artifacts: './src/artifacts'
  }
};

export default config;
