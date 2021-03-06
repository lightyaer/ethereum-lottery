// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }

    function pickWinner() public restricted {
        address winner = players[random() % players.length];
        payable(winner).transfer(address(this).balance);
        players = new address[](0);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
      }
}