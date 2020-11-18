pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Test", "TST") {
        _mint(msg.sender, initialSupply);
    }
}