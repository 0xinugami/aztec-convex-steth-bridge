// SPDX-License-Identifier: GPLv2

// Copyright 2020 Spilsbury Holdings Ltd
pragma solidity >=0.6.6 <0.8.0;
pragma experimental ABIEncoderV2;

import {UniswapV2Library} from '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';
import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';
import {Math} from '@openzeppelin/contracts/math/Math.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import {StakingRewards} from './StakingRewards.sol';

import {IDefiBridge} from './interfaces/IDefiBridge.sol';
import {Types} from './Types.sol';

import 'hardhat/console.sol';

interface IWstETH {
    function unwrap(uint256 _wstETHAmount) external returns (uint256);

    function wrap(uint256 _stETHAmount) external returns (uint256);
}

interface IWETH {
    function withdraw(uint256 wad) external;
}

interface IConvexPool {
    function depositAll(uint256 _pid, bool _stake) external returns (bool);
}

interface IConvexStakingRewards {
    function getReward() external returns (bool);

    function withdrawAndUnwrap(uint256 amount, bool claim) external returns (bool);
}

interface ICurvePool {
    function add_liquidity(uint256[2] calldata amounts, uint256 min_mint_amount) external payable returns (uint256);

    function remove_liquidity(uint256 amounts, uint256[2] calldata min_amounts) external returns (uint256[2] calldata);

    function calc_token_amount(uint256[2] calldata amounts, bool is_deposit) external view returns (uint256);

    function balances(uint256 i) external view returns (uint256);
}

interface ISushiSwapRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function WETH() external returns (address);

    function factory() external returns (address);
}

contract ConvexStETHPoolBridge is IDefiBridge {
    event CONVERT_ASSETS(uint256 indexed nonce, uint256 inputA, uint256 inputB, uint256 sharesOutput);
    event REDEEM_SHARES(uint256 indexed nonce, uint256 sharesInput, uint256 outputA, uint256 outputB);

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public immutable rollupProcessor;

    ISushiSwapRouter private constant _sushiSwapRouter = ISushiSwapRouter(0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);

    StakingRewards private immutable _stakingRewards;

    uint256 private constant _slippageMax = 10000; // support 2 decimal. 500 -> 5% and 10000 -> 100%

    IWstETH private constant _wrappedStETH = IWstETH(0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0);
    IERC20 private constant _stETH = IERC20(0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84);
    IERC20 private constant _convex = IERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    IERC20 private constant _curve = IERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    IERC20 private constant _lido = IERC20(0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32);

    uint8 private constant _curveETHIndex = 0;
    uint8 private constant _curveStETHIndex = 1;
    address private constant _curveLPToken = 0x06325440D014e39736583c165C2963BA99fAf14E;
    ICurvePool private constant _curvePool = ICurvePool(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022);

    IConvexStakingRewards private constant _convexRewards = IConvexStakingRewards(0x0A760466E1B4621579a82a39CB56Dda2F4E70f03);
    IConvexPool private constant _convexPool = IConvexPool(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
    uint256 private constant _convexStETHPoolPID = 25;

    mapping(uint256 => uint256) private _nonceBalance;

    constructor(address _rollupProcessor) public {
        rollupProcessor = _rollupProcessor;
        _stakingRewards = new StakingRewards(msg.sender, address(this), address(_sushiSwapRouter.WETH()));
    }

    receive() external payable {}

    /**
        Supporting 2 flow:
        1 - converting input tokens to virtual shares
        2 - convert shares back to input tokens + rewards
     */
    function convert(
        Types.AztecAsset calldata inputAssetA,
        Types.AztecAsset calldata inputAssetB,
        Types.AztecAsset calldata outputAssetA,
        Types.AztecAsset calldata outputAssetB,
        uint256 inputValue,
        uint256 interactionNonce,
        uint64 slippage
    )
        external
        payable
        override
        returns (
            uint256,
            uint256,
            bool
        )
    {
        require(msg.sender == rollupProcessor, 'ConvexStETHPoolBridge: INVALID_CALLER');
        require(slippage > 0 && slippage < _slippageMax, 'ConvexStETHPoolBridge: Invalid_SLIPPAGE');

        console.log('receiving ether %s', msg.value);
        console.log('account balance %s', address(this).balance);

        // subsidize harvesting
        harvest();

        // convert shares back to input tokens (wstETH and ETH)
        if (inputAssetA.assetType == Types.AztecAssetType.VIRTUAL) {
            (uint256 token0, uint256 token1) = _convertSharesToTokens(
                inputAssetA,
                inputAssetB,
                outputAssetA,
                outputAssetB,
                inputValue,
                interactionNonce,
                slippage
            );
            return (token0, token1, false);
        }

        // convert tokens into shares
        uint256 shares = _convertTokensToShares(inputAssetA, inputAssetB, outputAssetA, outputAssetB, inputValue, interactionNonce, slippage);
        return (shares, 0, false);
    }

    /**
        Convert Aztec Deposit into Staked Convex Position
        1. Validate correct input and output assets 
        2. Only rollup processor is allowed to call convert 
        3. Parse inputValue to wstETH and ETH 
        4. wstETH -> stETH 
        5. Deposit liquidity to curve and receive curve lp token 
        6. Deposit curve lp token and receive convex lp token. Record it with nonceBalance 
        7. Stake convex lp token to convex protocol and staking rewards 
        8. Return virtual shares
     */
    function _convertTokensToShares(
        Types.AztecAsset calldata inputAssetA,
        Types.AztecAsset calldata inputAssetB,
        Types.AztecAsset calldata outputAssetA,
        Types.AztecAsset calldata outputAssetB,
        uint256 inputValue,
        uint256 interactionNonce,
        uint64 slippage
    ) private returns (uint256) {
        require(
            inputAssetA.assetType == Types.AztecAssetType.NOT_USED || inputAssetA.assetType == Types.AztecAssetType.ETH,
            'ConvexStETHPoolBridge: INVALID_INPUT_A'
        );
        require(
            inputAssetB.assetType == Types.AztecAssetType.NOT_USED ||
                (inputAssetB.assetType == Types.AztecAssetType.ERC20 && inputAssetB.erc20Address == address(_wrappedStETH)),
            'ConvexStETHPoolBridge: INVALID_INPUT_B'
        );
        require(
            outputAssetA.assetType == Types.AztecAssetType.VIRTUAL && outputAssetB.assetType == Types.AztecAssetType.NOT_USED,
            'ConvexStETHPoolBridge: INVALID_OUTPUTS'
        );
        require(inputAssetA.assetType != Types.AztecAssetType.ETH || msg.value == inputValue, 'ConvexStETHPoolBridge: MISSING_ETH');

        // Parsing input value from rollup
        uint256 inputETH = inputAssetA.assetType == Types.AztecAssetType.NOT_USED ? 0 : inputValue;
        uint256 inputWstETH = inputAssetB.assetType == Types.AztecAssetType.NOT_USED ? 0 : inputValue;

        // Unwrap wstETH -> stETH
        uint256 inputStETH = inputWstETH > 0 ? _wrappedStETH.unwrap(inputWstETH) : 0;

        // Ensure invalid input
        require(inputETH != 0 || inputStETH != 0, 'ConvexStETHPoolBridge: MISSING_BALANCE');

        // add liquidity to curve
        uint256[2] memory amounts = [inputETH, inputStETH];

        IERC20(address(_stETH)).safeIncreaseAllowance(address(_curvePool), uint256(-1));
        uint256 mintAmount = _curvePool.calc_token_amount(amounts, true);
        uint256 minMintAmount = mintAmount.mul(_slippageMax.sub(slippage)).div(_slippageMax);
        uint256 lpTokenAmount = _curvePool.add_liquidity{value: amounts[_curveETHIndex]}(amounts, minMintAmount);

        // Stake in convex
        _nonceBalance[interactionNonce] = lpTokenAmount;
        IERC20(_curveLPToken).safeIncreaseAllowance(address(_convexPool), uint256(-1));
        bool deposited = _convexPool.depositAll(_convexStETHPoolPID, true);
        require(deposited, 'ConvexStETHPoolBridge: UNABLE_DEPOSIT_CONVEX');

        // Stake virtual amount into the yield pool
        _stakingRewards.stake(lpTokenAmount, interactionNonce);

        // Emit Event
        CONVERT_ASSETS(interactionNonce, inputETH, inputWstETH, lpTokenAmount);

        return lpTokenAmount;
    }

    /**
        convert virtual shares back to tokens + rewards
        1. Validate input and output 
        2. Update NonceBalance 
        3. Withdraw from convex 
        4. Exit rewards contract and collect rewards 
        5. Withdraw from curve 
        6. stETH -> wstETH
        7. Send balance to rollup processor
     */
    function _convertSharesToTokens(
        Types.AztecAsset calldata inputAssetA,
        Types.AztecAsset calldata inputAssetB,
        Types.AztecAsset calldata outputAssetA,
        Types.AztecAsset calldata outputAssetB,
        uint256 inputValue,
        uint256 interactionNonce,
        uint64 slippage
    ) private returns (uint256 ethOutput, uint256 wstETHOutput) {
        require(inputValue > 0 && inputValue <= _nonceBalance[interactionNonce], 'ConvexStETHPoolBridge: INVALID_INPUT_VALUE');
        require(inputAssetA.assetType == Types.AztecAssetType.VIRTUAL, 'ConvexStETHPoolBridge: INVALID_INPUTS');
        require(inputAssetB.assetType == Types.AztecAssetType.NOT_USED, 'ConvexStETHPoolBridge: INVALID_INPUTS');
        require(outputAssetA.assetType == Types.AztecAssetType.ETH, 'ConvexStETHPoolBridge: INVALID_OUTPUT_A');
        require(
            outputAssetB.assetType == Types.AztecAssetType.ERC20 && outputAssetB.erc20Address == address(_wrappedStETH),
            'ConvexStETHPoolBridge: INVALID_OUTPUT_B'
        );

        // update balance
        _nonceBalance[interactionNonce] = _nonceBalance[interactionNonce].sub(inputValue);

        // get earned rewards
        _stakingRewards.getReward(inputValue, interactionNonce);

        // withdraw from staking rewards
        _stakingRewards.withdraw(inputValue, interactionNonce);

        // withdraw from convex
        bool withdrewFromConvex = _convexRewards.withdrawAndUnwrap(inputValue, false);
        require(withdrewFromConvex, 'ConvexStETHPoolBridge: UNABLE_WITHDRAW_CONVEX_LP');

        // unstake from curve
        uint256 curveLPTokenBalances = IERC20(_curveLPToken).balanceOf(address(this));
        _curvePool.remove_liquidity(curveLPTokenBalances, _calcMinCurveLPMinOutputs(curveLPTokenBalances, slippage));

        // record output and send token to output processor
        _stETH.safeIncreaseAllowance(address(_wrappedStETH), uint256(-1));
        wstETHOutput = _wrappedStETH.wrap(_stETH.balanceOf(address(this)));
        IERC20(address(_wrappedStETH)).safeTransfer(rollupProcessor, wstETHOutput);

        address WETH = _sushiSwapRouter.WETH();
        IWETH(WETH).withdraw(IERC20(WETH).balanceOf(address(this)));

        ethOutput = address(this).balance;
        payable(rollupProcessor).transfer(ethOutput);

        // Emit Event
        REDEEM_SHARES(interactionNonce, inputValue, ethOutput, wstETHOutput);
    }

    // not used for sync flow
    function canFinalise(uint256) external view override returns (bool) {
        return false;
    }

    // not used for sync flow
    function finalise(
        Types.AztecAsset calldata,
        Types.AztecAsset calldata,
        Types.AztecAsset calldata,
        Types.AztecAsset calldata,
        uint256,
        uint64
    ) external payable override returns (uint256, uint256) {
        require(false);
    }

    /**
        Claim rewards from convex, convert to weth and distribute it to the staking contract
        1. Claim rewards from convex
        2. Sell it for WETH
        3. Deposit to the staking contract
     */
    function harvest() public {
        // harvest rewards
        _convexRewards.getReward();

        // sell rewards to ETH: crv, cvx, ldo
        uint256 crvRewards = _curve.balanceOf(address(this));
        uint256 cvxRewards = _convex.balanceOf(address(this));
        uint256 ldoRewards = _lido.balanceOf(address(this));

        _swapTokenForWETH(address(_curve), crvRewards);
        _swapTokenForWETH(address(_convex), cvxRewards);
        _swapTokenForWETH(address(_lido), ldoRewards);

        uint256 rewards = IERC20(_sushiSwapRouter.WETH()).balanceOf(address(this));

        console.log('rewards harvested %s', rewards);

        if (rewards > 0) {
            IERC20(_sushiSwapRouter.WETH()).safeTransfer(address(_stakingRewards), rewards);
            _stakingRewards.notifyRewardAmount(rewards);
        }
    }

    // Donate rewards to the staking contract
    function donate(uint256 amount) public {
        require(amount > 0, 'ConvexStETHPoolBridge: INVALID_DONATION');
        IERC20(_sushiSwapRouter.WETH()).safeTransferFrom(msg.sender, address(_stakingRewards), amount);
        _stakingRewards.notifyRewardAmount(amount);
    }

    // Get earned rewards
    function rewardsEarned(uint256 interactionNonce, uint256 shares) public view returns (uint256) {
        require(shares > 0 && shares <= _nonceBalance[interactionNonce], 'ConvexStETHPoolBridge: INVALID_SHARES_VALUE');
        uint256 earned = _stakingRewards.earned(interactionNonce);
        return earned.mul(shares).div(_nonceBalance[interactionNonce]);
    }

    // Get staking rewards contract
    function stakingRewards() public view returns (address) {
        return address(_stakingRewards);
    }

    // Swapping Token
    function _swapTokenForWETH(address token, uint256 amount) private {
        if (amount > 0) {
            IERC20(token).safeIncreaseAllowance(address(_sushiSwapRouter), uint256(-1));

            address[] memory path = new address[](2);
            path[0] = token;
            path[1] = _sushiSwapRouter.WETH();

            uint256 minOutput = UniswapV2Library.getAmountsOut(_sushiSwapRouter.factory(), amount, path)[1];
            _sushiSwapRouter.swapExactTokensForTokens(amount, minOutput, path, address(this), now.add(1800));
        }
    }

    // Withdrawal Slippage Calculation for Curve
    function _calcMinCurveLPMinOutputs(uint256 lpToken, uint256 slippage) private view returns (uint256[2] memory minOutputs) {
        uint256 totalSupply = IERC20(_curveLPToken).totalSupply();
        uint256[2] memory outputs = [
            _curvePool.balances(_curveETHIndex).mul(lpToken).div(totalSupply),
            _curvePool.balances(_curveStETHIndex).mul(lpToken).div(totalSupply)
        ];
        minOutputs = [
            outputs[_curveETHIndex].mul(_slippageMax.sub(slippage)).div(_slippageMax),
            outputs[_curveStETHIndex].mul(_slippageMax.sub(slippage)).div(_slippageMax)
        ];
    }
}
