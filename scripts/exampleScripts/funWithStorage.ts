const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const funWithStorage = await ethers.getContract("FunWithStorage", deployer)
    let response = await ethers.provider.getStorageAt(funWithStorage.address, 0)
    console.log(response)
    response = await ethers.provider.getStorageAt(funWithStorage.address, 1)
    console.log(response)
    response = await ethers.provider.getStorageAt(funWithStorage.address, 2)
    console.log(response)
    response = await ethers.provider.getStorageAt(funWithStorage.address, 3)
    console.log(response)
    const mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    console.log(mockV3Aggregator.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
