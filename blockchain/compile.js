const path = require('path');
const fs = require('fs');
const solc = require('solc');

const CONTRACT_FILE = 'Lottery.sol';

const lotteryPath = path.resolve(__dirname, 'contracts', CONTRACT_FILE);
const source = fs.readFileSync(lotteryPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    [CONTRACT_FILE]: {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const compiled = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  CONTRACT_FILE
].Lottery;

module.exports = {
  abi: compiled.abi,
  bytecode: compiled.evm.bytecode.object,
};
