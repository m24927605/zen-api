const express = require('express');
const router = express.Router();
const bip39 = require('bip39');
const zencashjs = require('zencashjs');
const { priKey, mnemonic, address } = require('../config/wallet');
const { getUnspent,getUnspentTotalAmount, getLatestBlockHash, getBlockHeight,determinePayFee, checkAmountBigthanFee,pushTX } = require('../services/zencash');
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/getunspent', async (req, res, next) => {
  const unspent = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb')
  res.json({ "unspent": unspent });
});

router.get('/getUnspentTotalAmount', async (req, res, next) => {
  const unspent = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
  const amount = await getUnspentTotalAmount(unspent);
  res.json({ "totalAmount": amount });
});

router.get('/determinePayFee', async (req, res, next) => {
  const payFee =await determinePayFee(6);
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
  const pubKey = zencashjs.address.privKeyToPubKey(priKey, true);
  const address = zencashjs.address.pubKeyToAddr(pubKey);
  res.json({ "address": address });
});

router.get('/mkPrivKey', (req, res, next) => {
  const mkPrivKey = zencashjs.address.mkPrivKey(mnemonic);
  res.json({ "mkPrivKey": mkPrivKey });
});

router.get('/private-address', (req, res, next) => {
  const priKey = zencashjs.zaddress.mkZSecretKey(mnemonic);
  const spendingKey = zencashjs.zaddress.zSecretKeyToSpendingKey(priKey);
  const payingKey = zencashjs.zaddress.zSecretKeyToPayingKey(priKey);
  const transmissionKey = zencashjs.zaddress.zSecretKeyToTransmissionKey(priKey);
  const private_address = zencashjs.zaddress.mkZAddress(payingKey, transmissionKey);
  res.json({ "private_address": private_address });
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
  try{
    const unspentArray=await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
    const totalAmount=await getUnspentTotalAmount(unspentArray);
    const payFee = await determinePayFee(6);
    const couldTX = await checkAmountBigthanFee(unspentArray, payFee);
    const blockhash = await getLatestBlockHash();
    const blockheight = await getBlockHeight(blockhash);
    const compressPubKey = true;
    const SIGHASH_ALL = 1;
    const sendAmount=1000000;
    const returnAmount=totalAmount-payFee-sendAmount;
    const receiverArray=[{address: 'znb9Nn6z7JR8RNPzVd5UJJadcp2ji8dAG9W', satoshis: sendAmount},{address: 'znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb', satoshis: returnAmount}]
    if(couldTX){
      let txobj= zencashjs.transaction.createRawTx(unspentArray,receiverArray,blockheight,blockhash);
      for(const [index, value] of unspentArray.entries()){
        txobj=zencashjs.transaction.signTx(txobj, index, priKey, compressPubKey);
      }
      const signed_serialized = zencashjs.transaction.serializeTx(txobj);
      res.json({ "signed_serialized": signed_serialized });
    }
  }catch(e){
    res.json({ "error": e });
  }
});

router.get('/sendTX',async (req, res, next)=>{
  try{
    const unspentArray=await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb');
    const totalAmount=await getUnspentTotalAmount(unspentArray);
    const payFee = await determinePayFee(6);
    const couldTX = await checkAmountBigthanFee(unspentArray, payFee);
    const blockhash = await getLatestBlockHash();
    const blockheight = await getBlockHeight(blockhash);
    const compressPubKey = true;
    const SIGHASH_ALL = 1;
    const sendAmount=1000000;
    const returnAmount=totalAmount-payFee-sendAmount;
    const receiverArray=[{address: 'znb9Nn6z7JR8RNPzVd5UJJadcp2ji8dAG9W', satoshis: sendAmount},{address: 'znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb', satoshis: returnAmount}]
    if(couldTX){
      let txobj= zencashjs.transaction.createRawTx(unspentArray,receiverArray,blockheight,blockhash);
      let j=0;
      for(let item of unspentArray){
        txobj=zencashjs.transaction.signTx(txobj, j, priKey, compressPubKey);
        j+=1;
      }
      const signed_serialized = zencashjs.transaction.serializeTx(txobj);
      const result=await pushTX(signed_serialized);
      res.json({ "sendTX": result });
    }
  }catch(e){
    res.json({ "error": e });
  }
})

module.exports = router;
