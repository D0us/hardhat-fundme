import { getNamedAccounts, ethers } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const fundValue = ethers.utils.parseEther("0.1")
    console.log("Funding...")
    const transactionResponse = await fundMe.fund({ value: fundValue })
    await transactionResponse.wait(1)
    console.log("Funded...")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
