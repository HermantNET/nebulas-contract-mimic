// Define deps
var BigNumber = require("bignumber.js")
const ContractStorage = require("./storage.js")
const LocalContractStorage = ContractStorage.lcs

const Date = function() {
  throw new Error("Date is not allowed in nvm.")
}

// Config env
Math.random = function() {
  throw new Error("Math.random func is not allowed in nvm.")
}

module.exports = {
  BigNumber,
  ContractStorage,
  Date,
  LocalContractStorage,
  Blockchain: {
    transaction: {
      from: "address_1",
      to: "contract_address",
    },
  },
  Events: {},
}
