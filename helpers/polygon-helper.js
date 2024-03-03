// helpers/polygon-helper.js
const { ethers } = require('ethers');

async function sendTransaction({ from, to, data }) {
  const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
  const wallet = new ethers.Wallet('6100da2fe13d92d50bcfa50e900dca845b04fb9ffb94f56caaba018d00ddb5c1', provider);

  const transaction = {
    from,
    to,
    data,
  };

  const signedTransaction = await wallet.sendTransaction(transaction);
  return signedTransaction.hash;
}

module.exports = { sendTransaction };
