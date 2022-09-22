import { network } from "hardhat"
import {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} from "../helper-hardhat.config"
// const { networkConfig } = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Local developement - use mock aggregator contract
    if (developmentChains.includes(network.name)) {
        log("Local network detected, deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mock deployed")
        log("----------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
