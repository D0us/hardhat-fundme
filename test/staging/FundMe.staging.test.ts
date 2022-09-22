import { getNamedAccounts, ethers, deployments, network } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { assert, expect } from "chai"
import { networkConfig, developmentChains } from "../../helper-hardhat.config"

// staging tests assume the contract is already deployed

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe: FundMe
          let deployer: any
          let mockV3Aggregator: MockV3Aggregator
          const sendValue = ethers.utils.parseEther("0.01")
          //   const sendValue = 10000000000000000
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )

              assert.equal(endingBalance.toString(), "0")
          })
      })
