const ext = require("./extensions"),
  colors = require("ansicolors"),
  log = ext.log,
  log2color = ext.log2color,
  logContract = ext.logContract,
  logJSON = ext.logJSON

// Instantiate the contract
log2color("\nCreating instance of ", "src/contract.js\n", "cyan")
const contract = new Contract()
contract.init()

logContract(true)

const test = async () => {
  // Testing
  log(colors.yellow("\n* * INFO * *\n"))
  // await ext.estimateGasDeploy()

  contract.newUser("Bobby Jenkins")
  contract.sendMessage("Hello, world!")

  Blockchain.transaction.from = "address_2"
  contract.newUser()
  contract.sendMessage("Hi")

  Blockchain.transaction.from = "address_1"
  contract.sendMessage("Nebulas rocks!")

  log2color("Message count: ", contract.getMessageCount())

  log("\nMessages:\n")
  logJSON(contract.getMessages())

  log("\nEND\n")
}

test()
