const fs = require("fs"),
  path = require("path"),
  colors = require("ansicolors"),
  got = require("got"),
  uglify = require("uglify-es"),
  syntax = require("cardinal"),
  theme = require("cardinal/themes/jq.js"),
  log = console.log

// Assign to Global
const ContractStorage = require("./storage.js"),
  LocalContractStorage = ContractStorage.lcs

Object.assign(global, {
  BigNumber: require("bignumber.js"),
  Contract: require("../contract"),
  ContractStorage,
  LocalContractStorage,
  Blockchain: {
    transaction: {
      from: "address_1",
      to: "contract_address",
    },
  },
  Events: {},
})

// Define helper functions
const estimateGasDeploy = async (args = []) => {
  if (typeof args !== "string") args = JSON.stringify(args)
  const contract = uglify.minify(
    fs.readFileSync(path.resolve(__dirname, "../contract.js"), "utf8")
  ).code

  const data = {
    from: "n1QZMXSZtW7BUerroSms4axNfyBGyFGkrh5",
    to: "n1QZMXSZtW7BUerroSms4axNfyBGyFGkrh5",
    value: "0",
    nonce: "0",
    gasPrice: "60",
    gasLimit: "50000000000",
    contract: {
      source: contract,
      sourceType: "js",
      args,
    },
  }

  const res = await got
    .post("https://testnet.nebulas.io/v1/user/estimateGas", {
      json: true,
      body: data,
    })
    .catch(console.log)

  log2color("Estimated gas to deploy contract: ", res.body.result.gas)
}

const log2color = (a, b, colorA = "yellow", colorB = "white") => {
  log(colors[colorA](a) + colors[colorB](b))
}

const logJSON = json => {
  log(
    syntax.highlight(JSON.stringify(json), {
      theme,
    })
  )
}

const logContract = (minify = false) => {
  const file = fs.readFileSync(
    path.resolve(__dirname, "../contract.js"),
    "utf8"
  )
  const contract = minify ? uglify.minify(file).code : file

  log(
    syntax.highlight(contract, {
      theme,
    })
  )
}

// Configure environment
Date.constructor = () => {
  console.log("Date is not allowed in nvm.")
  return Date.constructor(...arguments)
}

Math.random = () => {
  console.log("Math.random func is not allowed in nvm.")
  return Math.random(...arguments)
}

// Export helper functions
module.exports = {
  estimateGasDeploy,
  logContract,
  logJSON,
  log2color,
  log,
}
