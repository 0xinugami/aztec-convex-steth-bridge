import { ethers } from 'hardhat';
import hre from 'hardhat';
import abi from '../artifacts/contracts/ConvexStETHPoolBridge.sol/ConvexStETHPoolBridge.json';
import { Contract, Signer } from 'ethers';
import { DefiBridgeProxy, AztecAssetType } from './defi_bridge_proxy';
import { formatEther, parseEther } from '@ethersproject/units';
import { LIDO_ABI } from '../abi/lido';
import { WSTETH_ABI } from '../abi/wsteth';
import { CONVEX_REWARDS_ABI } from '../abi/convex_rewards';
import { WETH_ABI } from '../abi/weth';

describe('defi bridge', function () {
  let bridgeProxy: DefiBridgeProxy;
  let bridgeAddress: string;
  let signer: Signer;
  let signerAddress: string;
  let wstETHAddress: string;
  let lidoStakingAddress: string;
  let convexRewardsContract: Contract;
  let bridgeContract: Contract;
  let wethContract: Contract;

  beforeEach(async () => {
    // reset balance and impersonation each time since amount can change
    await hre.network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`
          }
        }
      ]
    });

    // Mock Signer
    signerAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [signerAddress]
    });
    signer = await ethers.getSigner(signerAddress);

    // Deploy Bridge Proxy and Pool Bridge
    bridgeProxy = await DefiBridgeProxy.deploy(signer);
    bridgeAddress = await bridgeProxy.deployBridge(signer, abi, []);

    // Wrap ETH -> wstETH and send to bridge proxy address to deposit
    wstETHAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
    lidoStakingAddress = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84';

    // 100000 eth -> steth
    const lidoContract = new Contract(lidoStakingAddress, LIDO_ABI, signer);
    let tx = await lidoContract.submit(ethers.constants.AddressZero, {
      value: parseEther('100000')
    });
    await tx.wait();

    tx = await lidoContract.approve(wstETHAddress, parseEther('10000000'));
    await tx.wait();

    // 10000 steth - wstETH
    const wstETHContract = new Contract(wstETHAddress, WSTETH_ABI, signer);
    tx = await wstETHContract.wrap(parseEther('10000'));
    await tx.wait();

    // send wstETH to the bridge contract
    tx = await wstETHContract.transfer(bridgeProxy.address, parseEther('1000'));
    await tx.wait();

    // Send some ether to bridge for deposit
    tx = await signer.sendTransaction({
      to: bridgeProxy.address,
      value: parseEther('10000')
    });
    await tx.wait();

    // Reusable Contract for testing
    convexRewardsContract = new Contract('0x0A760466E1B4621579a82a39CB56Dda2F4E70f03', CONVEX_REWARDS_ABI, signer);
    bridgeContract = new Contract(bridgeAddress, abi.abi, signer);
    wethContract = new Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', WETH_ABI, signer);
  });

  // WIP
  it('should able deposit 100 ETH', async () => {
    const inputValue = parseEther('100').toString();
    const { isAsync, outputValueA, outputValueB } = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.ETH,
        id: 0
      },
      {
        assetType: AztecAssetType.NOT_USED
      },
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED,
        id: 4
      },
      BigInt(inputValue),
      1n,
      100n
    );

    // Verify output
    expect(isAsync).toBe(false);
    expect(outputValueB).toBe(0n);
    expect(outputValueA).toBeGreaterThan(0n);

    // Verify token has successfully deposited to convex
    const depositedConvexBalance = await convexRewardsContract.balanceOf(bridgeAddress);
    expect(depositedConvexBalance.toBigInt()).toBeGreaterThan(0n);

    // Verify earned amount in staking rewards is 0
    let rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBe(0n);

    // Donate and ensure users earned more rewards
    const donation = parseEther('100');
    await wethContract.deposit({ value: donation }); // 1
    await wethContract.approve(bridgeAddress, donation);
    await bridgeContract.donate(donation);
    await hre.network.provider.send('evm_increaseTime', [86400]); // move time forward by 1 day
    await hre.network.provider.send('evm_mine');

    rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBeGreaterThan(donation.div(10).toBigInt());

    // Test Able To Withdraw Everything
    const res = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED
      },
      {
        assetType: AztecAssetType.ETH,
        id: 0
      },
      {
        assetType: AztecAssetType.ERC20,
        erc20Address: wstETHAddress,
        id: 1
      },
      depositedConvexBalance.toBigInt(),
      1n,
      100n
    );

    expect(res.isAsync).toBe(false);
    expect(res.outputValueA).toBeGreaterThan(BigInt(inputValue) / 2n);
    expect(res.outputValueB).toBeGreaterThan(BigInt(inputValue) / 2n);
  });

  // WIP
  it('should able deposit 100 wstETH', async () => {
    const inputValue = parseEther('100').toString();
    const { isAsync, outputValueA, outputValueB } = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.NOT_USED,
        id: 0
      },
      {
        assetType: AztecAssetType.ERC20,
        erc20Address: wstETHAddress,
        id: 1
      },
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED,
        id: 4
      },
      BigInt(inputValue),
      1n,
      100n
    );

    // Verify output
    expect(isAsync).toBe(false);
    expect(outputValueB).toBe(0n);
    expect(outputValueA).toBeGreaterThan(0n);

    // Verify token has successfully deposited to convex
    const depositedConvexBalance = await convexRewardsContract.balanceOf(bridgeAddress);
    expect(depositedConvexBalance.toBigInt()).toBeGreaterThan(0n);

    // Verify earned amount in staking rewards is 0
    let rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBe(0n);

    // Donate and ensure users earned more rewards
    const donation = parseEther('100');
    await wethContract.deposit({ value: donation }); // 1
    await wethContract.approve(bridgeAddress, donation);
    await bridgeContract.donate(donation);
    await hre.network.provider.send('evm_increaseTime', [86400]); // move time forward by 1 day
    await hre.network.provider.send('evm_mine');

    rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBeGreaterThan(donation.div(10).toBigInt());

    // Test Able To Withdraw Everything
    const res = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED
      },
      {
        assetType: AztecAssetType.ETH,
        id: 0
      },
      {
        assetType: AztecAssetType.ERC20,
        erc20Address: wstETHAddress,
        id: 1
      },
      depositedConvexBalance.toBigInt(),
      1n,
      100n
    );

    expect(res.isAsync).toBe(false);
    expect(res.outputValueA).toBeGreaterThan(BigInt(inputValue) / 2n);
    expect(res.outputValueB).toBeGreaterThan(BigInt(inputValue) / 2n);
  });

  // WIP
  it('should able deposit wstETH and ETH', async () => {
    const inputValue = parseEther('100').toString();
    const { isAsync, outputValueA, outputValueB } = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.ETH,
        id: 0
      },
      {
        assetType: AztecAssetType.ERC20,
        erc20Address: wstETHAddress,
        id: 1
      },
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED,
        id: 4
      },
      BigInt(inputValue),
      1n,
      100n
    );

    // Verify output
    expect(isAsync).toBe(false);
    expect(outputValueB).toBe(0n);
    expect(outputValueA).toBeGreaterThan(BigInt(inputValue));

    // Verify token has successfully deposited to convex
    const depositedConvexBalance = await convexRewardsContract.balanceOf(bridgeAddress);
    expect(depositedConvexBalance.toBigInt()).toBeGreaterThan(BigInt(inputValue));

    // Verify earned amount in staking rewards is 0
    let rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBe(0n);

    // Donate and ensure users earned more rewards
    const donation = parseEther('100');
    await wethContract.deposit({ value: donation }); // 1
    await wethContract.approve(bridgeAddress, donation);
    await bridgeContract.donate(donation);
    await hre.network.provider.send('evm_increaseTime', [86400]); // move time forward by 1 day
    await hre.network.provider.send('evm_mine');

    rewardsEarned = await bridgeContract.rewardsEarned(1n, depositedConvexBalance.toBigInt());
    expect(rewardsEarned.toBigInt()).toBeGreaterThan(donation.div(10).toBigInt());

    // Test Able To Withdraw Everything
    const res = await bridgeProxy.convert(
      signer,
      bridgeAddress,
      {
        assetType: AztecAssetType.VIRTUAL,
        id: 3
      },
      {
        assetType: AztecAssetType.NOT_USED
      },
      {
        assetType: AztecAssetType.ETH,
        id: 0
      },
      {
        assetType: AztecAssetType.ERC20,
        erc20Address: wstETHAddress,
        id: 1
      },
      depositedConvexBalance.toBigInt(),
      1n,
      100n
    );

    expect(res.isAsync).toBe(false);
    expect(res.outputValueA).toBeGreaterThan(BigInt(inputValue));
    expect(res.outputValueB).toBeGreaterThan(BigInt(inputValue));
  });
});
