const express = require('express');
const router = express.Router();
const bip39 = require('bip39');
const zencashjs = require('zencashjs');
const { priKey, mnemonic, address } = require('../config/wallet');
const { getUnspent, getLatestBlockHash, getBlockHeight, determinePayFee, checkAmountBigthanFee } = require('../services/zencash');
/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/getunspent', async (req, res, next) => {
  const unspent = await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb')
  res.json({ "unspent": unspent });
});

router.get('/determinePayFee', async (req, res, next) => {
  const determinePayFee = await determinePayFee(6)
  res.json({ "determinePayFee": determinePayFee });
});

router.get('/mnemonic', (req, res, next) => {
  const mnemonic = bip39.generateMnemonic();
  res.json({ "mnemonic": mnemonic });
});

router.get('/blockhash', async (req, res, next) => {
  const blockhash = await getLatestBlockHash()
  res.json({ "blockhash": blockhash });
});

router.get('/blockheight', async (req, res, next) => {
  const blockheight = await getBlockHeight('00000000032fc3dafb65b493df5e2a117d5685d50d9d00d23203b416ce94f006')
  res.json({ "blockheight": blockheight });
});

router.get('/normal-address', (req, res, next) => {
  const priKey = zencashjs.address.mkPrivKey(mnemonic);
  const pubKey = zencashjs.address.privKeyToPubKey(priKey, true);
  const address = zencashjs.address.pubKeyToAddr(pubKey)
  res.json({ "address": address });
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

router.get('/test', async (req, res, next) => {
  //const result=await getUnspent('znnA2VibNgeJfq41B44dWjXiGnv7GdAV2Lb')
  //const result=await getPayFee();
  let tmp = [
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "f7594235d06b5f00ff904a531a5ccd0d81dcbd835f6b9fecae93c09b5e0ec51f",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75658243,
      "satoshis": 875658243,
      "height": 381153,
      "confirmations": 1
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "3cd56e9ef58324054c93951b30fda88c893c1c46a5d7a865fa174060a8159ad8",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.7501,
      "satoshis": 875010000,
      "height": 381080,
      "confirmations": 74
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "3ade798a005392e8edd789391d7077e8de2ff35a0cf89b9692d505a2e9dc9b26",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75123762,
      "satoshis": 875123762,
      "height": 381075,
      "confirmations": 79
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "89ea50ac9d9f4e4a338d0fd52b0fc36817b5b5f613c2d78d407ca538d8133c95",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75133659,
      "satoshis": 875133659,
      "height": 381073,
      "confirmations": 81
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "bf25ed47923d5f6bd9093e4d62a417615a5bb5d84530013b9a89a656ac70c517",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75587696,
      "satoshis": 875587696,
      "height": 381049,
      "confirmations": 105
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "8de2185e283df143fb99742964414657af7dfe501e084e929e4b2d096afe0df9",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75443525,
      "satoshis": 875443525,
      "height": 381047,
      "confirmations": 107
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "a001f1e4448bc2871a5ee60a930258aad67585b5ac63afc1e03f3a528a95f342",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75186881,
      "satoshis": 875186881,
      "height": 381039,
      "confirmations": 115
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "bdd0bd1e7e6e744ba022bb82d056f3568dc2d457f3a8b1d8605030c3cc367c96",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75343762,
      "satoshis": 875343762,
      "height": 381038,
      "confirmations": 116
    },
    {
      "address": "znm27wSjzh6tqXKTXiCk2VCcEhSFT6nAd7i",
      "txid": "32746129edc2a4cf64d773f72b990f79528223b93a571f9f315ecfe294541f1c",
      "vout": 0,
      "scriptPubKey": "76a914daaad37631958f134e9cf9438fb44b539028d2a088ac",
      "amount": 8.75557042,
      "satoshis": 875557042,
      "height": 381025,
      "confirmations": 129
    }
  ]
  const payFee = await determinePayFee(6);
  const result = await checkAmountBigthanFee(tmp, payFee);
  zencashjs.transaction.createRawTx
  res.json({ "checkAmountBigthanFee": result });
});

module.exports = router;
