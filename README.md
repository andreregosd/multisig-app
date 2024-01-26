# Multi-Signature Wallet Provider
## Overview
Multi-Signature Wallet Provider is a web3 application that offers multi-signature wallets for any user of the ethereum blockchain.
This app was built in react and uses ethers.js to communicate with the blockchain.

## Description
This repository contains the frontend part of the application as a whole. It provides a user friendly interface to communicate with the smart contracts that are the vital part of the system.
The smart contracts: https://github.com/andreregosd/multisig-wallet-factory

## How it works
 - Open the web app
 - Connect your metamask
 - Go to `Create a new vault`
 - Add all the wallets you want (minimum of 3)
 - Set the required approvals (should be more than 50% of the number of wallets)
 - Click `Create`
 - Now every owner of the multi-sig wallet (or vault) can propose, approve and execute transactions.

## Contact
Feel free to report any issues or suggest improvements in the [Issues](https://github.com/andreregosd/multisig-app/issues) section.