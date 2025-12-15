// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FlightCoin is ERC20 {
    constructor() ERC20("FlightCoin", "FLC") {
        _mint(msg.sender, 1000000 * 10**18); // Admin có 1 triệu coin
    }
}