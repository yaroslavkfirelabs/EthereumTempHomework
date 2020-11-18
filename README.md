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
$ scripts/runganache.sh
$ scripts/runganache.sh
$ node cli.js deploy
```

## Deploy to Goerli
```
$ export ENV=goerli
$ node cli.js deploy
```

## Submit transaction
```
$ node cli.js submitransaction --to 0xbAe734893aa112c558Fef318EE558D5D0A955794 --amount 1 --currencyType gwei
```

## Confirm transaction
```
$ node cli.js confirmtransaction --transactionId 0 --publicKey 0xfdE925a53Da7d4ae925D5ea35003B5234cC07C74 --privateKey 2602894615564171f0e068c8a52921bed612dcc5486c22a37ce73e123468edd6
```