// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


error FundMe__NotOwner();
/**
 * @author Aldu
 */
contract FundMe {

    using PriceConverter for uint256;

    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18; // 50 usd * 19 to adjust for the fact everything is in wei
    AggregatorV3Interface private s_priceFeed;
    
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }    

    function fund() public payable {
        // require(msg.value.getConversionRate(priceFeedAddress) >= MINIMUM_USD, "You need to spend more ETH!");
        uint256 ethAmountInUsd = msg.value.getConversionRate(s_priceFeed);
        // string memory ethAmountInUsdString = Strings.toString(s);
        require(ethAmountInUsd >= MINIMUM_USD, "You need to spend more ETH");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // function getConversion(uint256 eth) public view returns (uint256) {
    //     return getConversionRate(eth, s_priceFeed);
    // }
    
    function getVersion() public view returns (uint256){
        return s_priceFeed.version();
    }

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    function withdraw() public payable onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess);
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly


