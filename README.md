## Installation
```
$ npm install -g truffle
$ npm install
```

## Run tests
```
$ truffle test
```

## Deploy locally
```
$ cp .development.env.example .development.env
$ scripts/runganache.sh
$ node cli.js deploy
```

## Select non-development environment
1. Ensure that environment exists in configs
2. Create and fill .env-name.env file for your environment
3. export ENV=env-name or add --environment env-name to every cli call

## Select private\public keys to execute transaction
Add --callerNumber with number of keys from the provided environment
Defaults fo first keys from the provided environment

## Deploy Multisig contract
```
$ node cli.js deploy
```
With '--ownersCount n' owners will be first n public keys from environment. Defaults to 3.
'--owners addr1 addr2 addrn' provide means to set them explicidly
'--requiredSigs' sets required signatures to execute a transaction. Defaults to 2.

## Submit Ether transaction
```
$ node cli.js submitethertransaction --to 0xbAe734893aa112c558Fef318EE558D5D0A955794 --amount 1 --currencyType gwei
```
Will automatically transfer required amount of ether from caller to a wallet contract in a transaction

## Submit ERC20 Token transaction
```
$ node cli.js submittokentransaction --to 0xbAe734893aa112c558Fef318EE558D5D0A955794 --amount 1 --currencyType gwei --tokenAddress 0x695F14f7b098FfeB2573B0db2082316831b2b825
```
'--tokenAddress' represends address of ERC20 token smart contract
Will first make a transaction to transfer required amount of tokens from the caller to the wallet contract

## Confirm transaction
```
$ node cli.js confirmtransaction --transactionId 0
```

## Get transaction info
```
$ node cli.js transactioninfo --transactionId 0
```

## Utility: Deploy test ERC20 token contract
```
$ node cli.js deploytesttoken
```

## Utility: Get amount of ERC20 tokens
```
$ node cli.js tokeninfo --tokenAddress 0x695F14f7b098FfeB2573B0db2082316831b2b825
```
Provides amount for a current caller by default
'--address' can be used to set address explicidly