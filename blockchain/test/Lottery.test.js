const ganache = require("ganache-core");
const Web3 = require("web3");
const { abi, bytecode } = require("../compile");
const assert = require("assert");
const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(players.length, 1);
    assert.strictEqual(players[0], accounts[0]);
  });

  it("allows multiple account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.strictEqual(players.length, 3);
    assert.strictEqual(players[0], accounts[0]);
    assert.strictEqual(players[1], accounts[1]);
    assert.strictEqual(players[2], accounts[2]);
  });

  it("requires  a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[2],
        value: "200",
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and resets the player array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const winningBalance = await web3.eth.getBalance(accounts[0]);

    const difference = winningBalance - initialBalance;
    console.log(difference);
    assert(difference > web3.utils.toWei("1.99", "ether"));
  });
});
