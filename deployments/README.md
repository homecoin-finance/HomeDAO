## Deployments Directory

This is a saved off version of our contract deployments. It shows the address and transaction of each contract on each network

## Generating Deployments

From the root of this repo:
```
./scripts/deployments.py save
```

## Restoring Deployments

After compiling your contracts, load in the network addresses of them with this command
```
./scripts/deployments.py restore
```

This is useful if you want to clear out your built contracts in order to re-compile but still want to be able to interact with the contracts on chain
