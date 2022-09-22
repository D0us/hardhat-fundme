import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { assert, expect } from "chai"
import { developmentChains } from "../../helper-hardhat.config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe: FundMe
          let deployer: any
          let mockV3Aggregator: MockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              // deploy fundMe contract using hardhat-deploy

              // Two waits to get signers using ethers or getNamedAccounts
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              // const { deployer } = await getNamedAccounts()

              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              console.log(fundMe.address)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              // it("sets the aggregator addresses correctly", async () => {
              //     const response = await fundMe.priceFeed()
              //     assert.equal(response, mockV3Aggregator.address)
              // })
          })

          // it fails if you don't send enough ETH
          it("fails if you don't send enough eth", async function () {
              await expect(fundMe.fund()).to.be.revertedWith(
                  "You need to spend more ETH"
              )
          })

          // it updated the amount funded data structure
          it("updated the amount funded data struture", async function () {
              // const version = await fundMe.getVersion()
              await fundMe.fund({ value: sendValue })
              const response = await fundMe.s_addressToAmountFunded(deployer)
              assert.equal(response.toString(), sendValue.toString())
          })

          it("adds funder to array of funders", async function () {
              await fundMe.fund({ value: sendValue })
              const responseAddress = await fundMe.s_funders(0)
              assert.equal(deployer, responseAddress)
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw funds from a single founder", async function () {
                  // arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingBalanceContract =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingBalanceDeployer =
                      await fundMe.provider.getBalance(deployer)
                  // asserta
                  assert.equal(Number(endingBalanceContract), 0)
                  // expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
                  //     endingBalanceDeployer
                  // )
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingBalanceDeployer.add(gasCost).toString()
                  )
              })

              it("withdraws from several funders", async () => {
                  // arranges
                  // send from several accounts
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < accounts.length; i++) {
                      const fundMeConnected = await fundMe.connect(accounts[i])
                      await fundMeConnected.fund({ value: sendValue })
                  }

                  // act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // assert

                  // doing lookup on addresses(0) should revert
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  // check address funds are 0
                  for (let i = 1; i < accounts.length; i++) {
                      const balance = await fundMe.s_addressToAmountFunded(
                          accounts[i].address
                      )
                      assert.equal(balance.toString(), "0")
                  }
              })

              it("does not allow non-owner to withdraw", async function () {
                  const attacker = (await ethers.getSigners())[1]
                  const fundMeConnectedContract = await fundMe.connect(attacker)
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })

          describe("cheaper withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw funds from a single founder", async function () {
                  // arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingBalanceContract =
                      await fundMe.provider.getBalance(fundMe.address)
                  const endingBalanceDeployer =
                      await fundMe.provider.getBalance(deployer)
                  // asserta
                  assert.equal(Number(endingBalanceContract), 0)
                  // expect(startingFundMeBalance.add(startingDeployerBalance)).to.equal(
                  //     endingBalanceDeployer
                  // )
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingBalanceDeployer.add(gasCost).toString()
                  )
              })

              it("withdraws from several funders", async () => {
                  // arranges
                  // send from several accounts
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < accounts.length; i++) {
                      const fundMeConnected = await fundMe.connect(accounts[i])
                      await fundMeConnected.fund({ value: sendValue })
                  }

                  // act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // assert

                  // doing lookup on addresses(0) should revert
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  // check address funds are 0
                  for (let i = 1; i < accounts.length; i++) {
                      const balance = await fundMe.s_addressToAmountFunded(
                          accounts[i].address
                      )
                      assert.equal(balance.toString(), "0")
                  }
              })

              it("does not allow non-owner to withdraw", async function () {
                  const attacker = (await ethers.getSigners())[1]
                  const fundMeConnectedContract = await fundMe.connect(attacker)
                  await expect(
                      fundMeConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
