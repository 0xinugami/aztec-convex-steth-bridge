export const LIDO_ABI = [
  { constant: false, inputs: [], name: 'resume', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
  { constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'pure', type: 'function' },
  { constant: false, inputs: [], name: 'stop', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'hasInitialized',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'depositContract', type: 'address' },
      { name: '_oracle', type: 'address' },
      { name: '_operators', type: 'address' },
      { name: '_treasury', type: 'address' },
      { name: '_insuranceFund', type: 'address' }
    ],
    name: 'initialize',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getInsuranceFund',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_ethAmount', type: 'uint256' }],
    name: 'getSharesByPooledEth',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_sender', type: 'address' },
      { name: '_recipient', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getOperators',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_script', type: 'bytes' }],
    name: 'getEVMScriptExecutor',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'pure', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'getRecoveryVault',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'DEPOSIT_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'DEPOSIT_SIZE',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getTotalPooledEther',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'PAUSE_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_addedValue', type: 'uint256' }
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getTreasury',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'SET_ORACLE',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { constant: true, inputs: [], name: 'isStopped', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'MANAGE_WITHDRAWAL_KEY',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getBufferedEther',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'SIGNATURE_LENGTH',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getWithdrawalCredentials',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getFeeDistribution',
    outputs: [
      { name: 'treasuryFeeBasisPoints', type: 'uint16' },
      { name: 'insuranceFeeBasisPoints', type: 'uint16' },
      { name: 'operatorsFeeBasisPoints', type: 'uint16' }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_sharesAmount', type: 'uint256' }],
    name: 'getPooledEthByShares',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_oracle', type: 'address' }],
    name: 'setOracle',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'token', type: 'address' }],
    name: 'allowRecoverability',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { constant: true, inputs: [], name: 'appId', outputs: [{ name: '', type: 'bytes32' }], payable: false, stateMutability: 'view', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'getOracle',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getInitializationBlock',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_treasuryFeeBasisPoints', type: 'uint16' },
      { name: '_insuranceFeeBasisPoints', type: 'uint16' },
      { name: '_operatorsFeeBasisPoints', type: 'uint16' }
    ],
    name: 'setFeeDistribution',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_feeBasisPoints', type: 'uint16' }],
    name: 'setFee',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_maxDeposits', type: 'uint256' }],
    name: 'depositBufferedEther',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  { constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'pure', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'MANAGE_FEE',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_token', type: 'address' }],
    name: 'transferToVault',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'SET_TREASURY',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_sender', type: 'address' },
      { name: '_role', type: 'bytes32' },
      { name: '_params', type: 'uint256[]' }
    ],
    name: 'canPerform',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_referral', type: 'address' }],
    name: 'submit',
    outputs: [{ name: '', type: 'uint256' }],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'WITHDRAWAL_CREDENTIALS_LENGTH',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_subtractedValue', type: 'uint256' }
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getEVMScriptRegistry',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'PUBKEY_LENGTH',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_amount', type: 'uint256' },
      { name: '_pubkeyHash', type: 'bytes32' }
    ],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_recipient', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getDepositContract',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getBeaconStat',
    outputs: [
      { name: 'depositedValidators', type: 'uint256' },
      { name: 'beaconValidators', type: 'uint256' },
      { name: 'beaconBalance', type: 'uint256' }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'BURN_ROLE',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_insuranceFund', type: 'address' }],
    name: 'setInsuranceFund',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getFee',
    outputs: [{ name: 'feeBasisPoints', type: 'uint16' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'SET_INSURANCE_FUND',
    outputs: [{ name: '', type: 'bytes32' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { constant: true, inputs: [], name: 'kernel', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function' },
  {
    constant: true,
    inputs: [],
    name: 'getTotalShares',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'isPetrified',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_withdrawalCredentials', type: 'bytes32' }],
    name: 'setWithdrawalCredentials',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  { constant: false, inputs: [], name: 'depositBufferedEther', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
  {
    constant: false,
    inputs: [
      { name: '_account', type: 'address' },
      { name: '_sharesAmount', type: 'uint256' }
    ],
    name: 'burnShares',
    outputs: [{ name: 'newTotalShares', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: '_treasury', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: '_beaconValidators', type: 'uint256' },
      { name: '_beaconBalance', type: 'uint256' }
    ],
    name: 'pushBeacon',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '_account', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'executor', type: 'address' },
      { indexed: false, name: 'script', type: 'bytes' },
      { indexed: false, name: 'input', type: 'bytes' },
      { indexed: false, name: 'returnData', type: 'bytes' }
    ],
    name: 'ScriptResult',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'vault', type: 'address' },
      { indexed: true, name: 'token', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'RecoverToVault',
    type: 'event'
  },
  { anonymous: false, inputs: [], name: 'Stopped', type: 'event' },
  { anonymous: false, inputs: [], name: 'Resumed', type: 'event' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'spender', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Approval',
    type: 'event'
  },
  { anonymous: false, inputs: [{ indexed: false, name: 'feeBasisPoints', type: 'uint16' }], name: 'FeeSet', type: 'event' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'treasuryFeeBasisPoints', type: 'uint16' },
      { indexed: false, name: 'insuranceFeeBasisPoints', type: 'uint16' },
      { indexed: false, name: 'operatorsFeeBasisPoints', type: 'uint16' }
    ],
    name: 'FeeDistributionSet',
    type: 'event'
  },
  { anonymous: false, inputs: [{ indexed: false, name: 'withdrawalCredentials', type: 'bytes32' }], name: 'WithdrawalCredentialsSet', type: 'event' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'referral', type: 'address' }
    ],
    name: 'Submitted',
    type: 'event'
  },
  { anonymous: false, inputs: [{ indexed: false, name: 'amount', type: 'uint256' }], name: 'Unbuffered', type: 'event' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'sender', type: 'address' },
      { indexed: false, name: 'tokenAmount', type: 'uint256' },
      { indexed: false, name: 'sentFromBuffer', type: 'uint256' },
      { indexed: true, name: 'pubkeyHash', type: 'bytes32' },
      { indexed: false, name: 'etherAmount', type: 'uint256' }
    ],
    name: 'Withdrawal',
    type: 'event'
  }
];
