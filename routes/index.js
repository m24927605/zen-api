const express = require('express');
const router = express.Router();
const bip39 = require('bip39');
const zencashjs = require('zencashjs');
const { priKey, mnemonic, address } = require('../config/wallet');
const { getUnspent, getTXHistory, getUnspentForTX, getUnspentTotalAmount, getLatestBlockHash, getBlockHash, getBlockHeight, determinePayFee, checkAmountBigthanFee, pushTX } = require('../services/zencash');
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/getunspent', async (req, res, next) => {
  const unspent = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb')
  res.json({ "unspent": unspent });
});

router.get('/getUnspentForTX', async (req, res, next) => {
  const unspentForTX = await getUnspentForTX('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb')
  res.json({ "unspentForTX": unspentForTX });
});

router.get('/getUnspentTotalAmount', async (req, res, next) => {
  const unspent = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
  const amount = await getUnspentTotalAmount(unspent);
  res.json({ "totalAmount": amount });
});

router.get('/determinePayFee', async (req, res, next) => {
  const payFee = await determinePayFee(6);
  res.json({ "determinePayFee": payFee });
});

router.get('/mnemonic', (req, res, next) => {
  const mnemonic = bip39.generateMnemonic();
  res.json({ "mnemonic": mnemonic });
});

router.get('/blockhash', async (req, res, next) => {
  const blockhash = await getLatestBlockHash();
  res.json({ "blockhash": blockhash });
});

router.get('/blockheight', async (req, res, next) => {
  const blockhash = await getLatestBlockHash();
  const blockheight = await getBlockHeight(blockhash);
  res.json({ "blockheight": blockheight });
});

router.get('/normal-address', (req, res, next) => {
  const priKey = zencashjs.address.mkPrivKey(mnemonic);
  const pubKey = zencashjs.address.privKeyToPubKey('39dc17001e8f0e86e080029c9f0b4c63ec2e0466c5168f5af500c469c5ba9887', true);
  const address = zencashjs.address.pubKeyToAddr(pubKey);
  res.json({ "address": address });
});
router.get('/mkPrivKey', (req, res, next) => {
  const mkPrivKey = zencashjs.address.mkPrivKey(mnemonic);
  res.json({ "mkPrivKey": mkPrivKey });
});

router.get('/wif_to_prikey', (req, res, next) => {
  const prikey = zencashjs.address.WIFToPrivKey('KyABYcXN6JUgFMSJq7iopMJnbgUHFwEoBHavgzNa6kcXrkccTnmt');
  res.json({ "prikey": prikey });
});

router.get('/private-address', (req, res, next) => {
  const priKey = zencashjs.zaddress.mkZSecretKey(mnemonic);
  const spendingKey = zencashjs.zaddress.zSecretKeyToSpendingKey(priKey);
  const payingKey = zencashjs.zaddress.zSecretKeyToPayingKey(priKey);
  const transmissionKey = zencashjs.zaddress.zSecretKeyToTransmissionKey(priKey);
  const private_address = zencashjs.zaddress.mkZAddress(payingKey, transmissionKey);
  res.json({ "private_address": private_address });
});

router.get('/signed_serialized', async (req, res, next) => {
  try {
    const unspentArray = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
    const unspentForTXArray = await getUnspentForTX('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
    const totalAmount = await getUnspentTotalAmount(unspentArray);
    const payFee = await determinePayFee(6);
    const couldTX = await checkAmountBigthanFee(unspentArray, payFee);
    const blockhash = await getLatestBlockHash();
    const blockheight = await getBlockHeight(blockhash);
    const compressPubKey = true;
    const SIGHASH_ALL = 1;
    const sendAmount = 1000000;
    const returnAmount = totalAmount - payFee - sendAmount;
    const receiverArray = [{ address: 'znb9Nn6z7JR8RNPzVd5UJJadcp2ji8dAG9W', satoshis: sendAmount }, { address: 'znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb', satoshis: returnAmount }]
    if (couldTX) {
      var txobj = zencashjs.transaction.createRawTx(unspentForTXArray, receiverArray, blockheight, blockhash);
      var signedobj = '';
      let j = 0;
      // Remove prevScriptPubKey since it's not really an attribute
      for (var i = 0; i < txobj.ins.length; i++) {
        txobj.ins[i].prevScriptPubKey = ''
      }
      for (let item of unspentArray) {
        signedobj = zencashjs.transaction.signTx(txobj, j, priKey, compressPubKey, SIGHASH_ALL);
        j += 1;
      }
      var signed_serialized = zencashjs.transaction.serializeTx(signedobj);
      res.json({ "signed_serialized": signed_serialized });
    }
  } catch (e) {
    console.error('錯誤', e);
    res.send(e)
  }
});

router.get('/sendTX', async (req, res, next) => {
  try {
    const fromAddress = address;
    const lastItem = x => x[x.length - 1];
    const satoshisToSend = 1000000;
    const satoshisfeesToSend = await determinePayFee(6);
    const targetSatoshis = satoshisToSend + satoshisfeesToSend;
    const unspentForTXArray = await getUnspentForTX(fromAddress, targetSatoshis);
    const refundSatoshis = lastItem(unspentForTXArray).cumSatoshis - targetSatoshis;
    const blockhash = await getLatestBlockHash();
    const blockheight = await getBlockHeight(blockhash);
    const blockheightForTX = blockheight - 300;
    const blockhashForTX = await getBlockHash(blockheightForTX);
    const compressPubKey = true;
    const SIGHASH_ALL = 1;
    const receiverArray = [{ address: 'znb9Nn6z7JR8RNPzVd5UJJadcp2ji8dAG9W', satoshis: satoshisToSend, data: 'Hello World' }, { address: fromAddress, satoshis: refundSatoshis }];

    let txobj = zencashjs.transaction.createRawTx(unspentForTXArray, receiverArray, blockheightForTX, blockhashForTX);

    for (let i = 0; i < txobj.ins.length; i++) {
      txobj = zencashjs.transaction.signTx(txobj, i, priKey, compressPubKey, SIGHASH_ALL);
    }

    let signed_serialized = zencashjs.transaction.serializeTx(txobj);

    const result = await pushTX(signed_serialized);
    res.json({ "sendTX": result });
  } catch (e) {
    console.error('錯誤', e);
    res.send(e)
  }
})

module.exports = router;


