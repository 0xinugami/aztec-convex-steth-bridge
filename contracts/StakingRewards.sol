// SPDX-License-Identifier: GPLv2

pragma solidity ^0.6.10;

import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';
import {SafeERC20, IERC20} from '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';

// Inheritance
import './RewardsDistributionRecipient.sol';

contract StakingRewards is RewardsDistributionRecipient {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public rewardsToken;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(uint256 => uint256) public nonceRewardPerTokenPaid;
    mapping(uint256 => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(uint256 => uint256) private _balances;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _owner,
        address _rewardsDistribution,
        address _rewardsToken
    ) public Owned(_owner) {
        rewardsToken = IERC20(_rewardsToken);
        rewardsDistribution = _rewardsDistribution;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(uint256 interactionNonce) external view returns (uint256) {
        return _balances[interactionNonce];
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored.add(lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(_totalSupply));
    }

    function earned(uint256 interactionNonce) public view returns (uint256) {
        return
            _balances[interactionNonce].mul(rewardPerToken().sub(nonceRewardPerTokenPaid[interactionNonce])).div(1e18).add(rewards[interactionNonce]);
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount, uint256 interactionNonce) external onlyRewardsDistribution updateReward(interactionNonce) {
        require(amount > 0, 'Cannot stake 0');
        require(_balances[interactionNonce] == 0, 'Invalid nonce');
        _totalSupply = _totalSupply.add(amount);
        _balances[interactionNonce] = _balances[interactionNonce].add(amount);
        emit Staked(interactionNonce, amount);
    }

    function withdraw(uint256 amount, uint256 interactionNonce) public onlyRewardsDistribution updateReward(interactionNonce) {
        require(amount > 0, 'Cannot withdraw 0');
        _totalSupply = _totalSupply.sub(amount);
        _balances[interactionNonce] = _balances[interactionNonce].sub(amount);
        emit Withdrawn(interactionNonce, amount);
    }

    function getReward(uint256 amount, uint256 interactionNonce) public onlyRewardsDistribution updateReward(interactionNonce) {
        require(_balances[interactionNonce] > 0 && amount <= _balances[interactionNonce], 'Invalid balance');
        uint256 totalReward = rewards[interactionNonce];
        uint256 reward = totalReward.mul(amount).div(_balances[interactionNonce]);
        if (reward > 0) {
            rewards[interactionNonce] = totalReward.sub(reward);
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(interactionNonce, reward);
        }
    }

    function exit(uint256 interactionNonce) external onlyRewardsDistribution {
        withdraw(_balances[interactionNonce], interactionNonce);
        getReward(interactionNonce, _balances[interactionNonce]);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function notifyRewardAmount(uint256 reward) external override onlyRewardsDistribution {
        updateRewardPerTokenAndLastUpdateTime();
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = rewardsToken.balanceOf(address(this));
        require(rewardRate <= balance.div(rewardsDuration), 'Provided reward too high');

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(block.timestamp > periodFinish, 'Previous rewards period must be complete before changing the duration for the new period');
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(uint256 interactionNonce) {
        updateRewardPerTokenAndLastUpdateTime();
        rewards[interactionNonce] = earned(interactionNonce);
        nonceRewardPerTokenPaid[interactionNonce] = rewardPerTokenStored;
        _;
    }

    /* ========== PRIVATE ========== */

    function updateRewardPerTokenAndLastUpdateTime() private {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(uint256 indexed interactionNonce, uint256 amount);
    event Withdrawn(uint256 indexed interactionNonce, uint256 amount);
    event RewardPaid(uint256 indexed interactionNonce, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
}
