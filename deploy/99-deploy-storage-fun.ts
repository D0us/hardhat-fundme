import { network, ethers } from "hardhat"
import { networkConfig, developmentChains } from "../helper-hardhat.config"
import { verify } from "../utils/verify"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("----------------------------------------------------")
    log("Deploying FunWithStorage and waiting for confirmations...")
    const funWithStorage = await deploy("FunWithStorage", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(funWithStorage.address, [])
    }

    log("Logging storage...")
    for (let i = 0; i < 10; i++) {
        log(
            `Location ${i}: ${await ethers.provider.getStorageAt(
                funWithStorage.address,
                i
            )}`
        )
    }

    // You can use this to trace!
    const trace = await network.provider.send("debug_traceTransaction", [
        funWithStorage.transactionHash,
    ])
    for (let structLog in trace.structLogs) {
        if (trace.structLogs[structLog].op == "SSTORE") {
            console.log(trace.structLogs[structLog])
        }
    }
    const firstelementLocation = ethers.utils.keccak256(
        "0x0000000000000000000000000000000000000000000000000000000000000002"
    )
    const arrayElement = await ethers.provider.getStorageAt(
        funWithStorage.address,
        firstelementLocation
    )
    log(`Location ${firstelementLocation}: ${arrayElement}`)

    // Can you write a function that finds the storage slot of the arrays and mappings?
    // And then find the data in those slots?
}

// Assumes the value of
const getStorageSlot = async (storageIndexHex: string) => {
    const elementLocation = ethers.utils.keccak256(storageIndexHex)
}

module.exports.tags = ["storage"]
