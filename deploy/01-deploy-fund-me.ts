import { network } from "hardhat"
import { experimentalAddHardhatNetworkMessageTraceHook } from "hardhat/config"
import { networkConfig, developmentChains } from "../helper-hardhat.config"
import { verify } from "../utils/verify"

// const { networkConfig } = require("../helper-hardhat.config")
module.exports = async ({ getNamedAccounts, deployments }) => {
    // console.log(process.env)
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeed
    if (developmentChains.includes(network.name)) {
        // local mock
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeed = ethUsdAggregator.address
    } else {
        // test chain=-
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeed]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("---------------------------------")

    // Non dev chain - verify
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}
module.exports.tags = ["all", "fundme"]
