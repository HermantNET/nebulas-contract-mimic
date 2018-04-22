# Nebulas Contract Mimic

The goal of this project is to allow developers to develop smart contracts for the Nebulas blockchain quickly and locally, without the hassle of managing addresses, a localnet, etc. This project uses modified source code from Nebulas project. The modifications in place are to absolve the dependency on a blockchain, instead being replaced with mimic code to keep thing fast and local.

Important: This project is in it's very early stages. Many things may not work. Take a look at `src/index.js` to get an idea of the current workflow, or `src/_extensions/index.js` to see the ported or mimiced featueres available.

## Get Started

### Prerequisites

* Node.js

#### Execute the example contract

1.  Open the terminal and navigate to the directory where this file resides, ie. after running git clone type:

`cd nebulas-contract-mimic`

2.  To execute the example contract, run:

`node src/index.js`
