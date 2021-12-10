<template>
  <h2>Lottery Contract</h2>
  <p>
    This contract is managed by <strong>{{ manager }}</strong>
  </p>
  <p>
    There are currently {{ numberOfPlayers.length }} people entered, competing
    to win {{ balance ? web3.utils.fromWei(balance) : 0 }} ether!
  </p>
  <hr />
  <form @submit.prevent="enter">
    <h4>Want to try your luck?</h4>

    <div>
      <label>Amount of ether to enter</label>
      <input type="number" step=".001" v-model="ether" />
    </div>
    <br />
    <button type="submit">Enter</button>
  </form>
  <hr />

  <h2>{{ message }}</h2>

  <hr />
  <h4>Time to pick a winner?</h4>
  <button @click="pickWinner">Pick Winner</button>
</template>

<script setup>
import { onMounted, ref } from "vue";
import web3 from "./web3";
import lottery from "./lottery";

const manager = ref("");
const numberOfPlayers = ref(0);
const balance = ref(null);
const ether = ref(0);
const message = ref(
  "Connect your wallet and send some ether in, minimum is 0.01 ether"
);

onMounted(async () => {
  manager.value = await lottery.methods.manager().call();
  numberOfPlayers.value = await lottery.methods.getPlayers().call();
  balance.value = await web3.eth.getBalance(lottery.options.address);
});

const enter = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    message.value = "Waiting on transaction success....";

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(ether.value.toString(), "ether"),
    });

    message.value = "You have been entered!!";
  } catch (error) {
    console.log(error);
    if (error["code"] === 4001) {
      message.value = "You denied the transaction, anything wrong?";
    } else {
      message.value = "Something went wrong, please try again later!";
    }
  }
};

const pickWinner = async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    message.value = "Waiting to pick Winner....";

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    message.value = "A winner has been picked";
  } catch (error) {
    console.log(error);
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #1b1b1b;
  margin-top: 4rem;
}

label {
  margin-right: 1rem;
}
</style>
