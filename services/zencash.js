const rp = require('request-promise');
const zencashjs = require('zencashjs');
const math = require('mathjs');

exports.getUnspent=(address)=>{
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`${address}查詢 unspent`)
      const options = {
        uri: `https://explorer.zensystem.io/api/addr/${address}/utxo`,
        json: true // Automatically parses the JSON string in the response
      };
      const result = await rp.get(options);
      resolve(result);
    } catch (e) {  
      if (e.message.includes('No free outputs to spend')) {
        console.error(`${address} catch ${e.message}`);
        resolve({});
      } else {
        console.error(`地址：${address} [getUnspent] 失敗`);
        reject(`[getUnspent] ${e}`);
      }
    }
  });
}

exports.getPayFee=()=>{
  return new Promise(async (resolve, reject) => {
    try {
      const blocks='6';
      const options = {
        uri: `https://explorer.zensystem.io/api/utils/estimatefee?nbBlocks=${blocks}`,
        json: true // Automatically parses the JSON string in the response
      };
      const result = await rp.get(options);
      resolve(result[blocks]*10);
    } catch (e) {  
      console.error(`[estimateFee] 失敗`);
      reject(`[getUnspent] ${e}`);
    }
  });
}

exports.getLatestBlockHash=()=>{
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        uri: `https://explorer.zensystem.io/api/status?q=getLastBlockHash`,
        json: true // Automatically parses the JSON string in the response
      };
      const result = await rp.get(options);
      resolve(result['lastblockhash']);
    } catch (e) {  
      console.error(`[estimateFee] 失敗`);
      reject(`[getUnspent] ${e}`);
    }
  });
}

exports.getBlockHeight=(blockHash)=>{
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        uri: `https://explorer.zensystem.io/api/block/${blockHash}`,
        json: true // Automatically parses the JSON string in the response
      };
      const result = await rp.get(options);
      resolve(result['height']);
    } catch (e) {  
      console.error(`[estimateFee] 失敗`);
      reject(`[getUnspent] ${e}`);
    }
  });
}

exports.checkAmountBigthanFee=(unspentArray,payFee)=>{
  return new Promise(async(resolve, reject)=>{
    try{
      let isBig=false;
      let sum=0;
      for(let unspentItem of unspentArray){
        sum=math.eval(`${sum} + ${unspentItem.amount}`);
      }
      let toAmount=math.eval(`${sum} - ${payFee}`);
      (toAmount>0)?isBig=true:isBig=false;
      resolve(isBig);
    }catch(e){
      console.error(`[checkAmountBigthanFee] 失敗`);
      reject(e);
    }
  }) 
}

exports.signTX=(unspentArray,nowBlockHash,nowBlockHeight,sendAmountSatoshis,receiverAddress,message,priKey)=>{
  return new Promise(async(resolve, reject)=>{
    try{
      const txobj = zencashjs.transaction.createRawTx(
        unspentArray,
        [{address: receiverAddress, satoshis: sendAmountSatoshis}],
        nowBlockHeight,
        nowBlockHash
      );

      const compressPubKey = true;
      const SIGHASH_ALL = 1;
      const signedobj = zencashjs.transaction.signTx(txobj, 0, priKey, compressPubKey, SIGHASH_ALL);
      const signed_serialized = zencashjs.transaction.serializeTx(signedobj);
      resolve(signed_serialized);
    }catch(e){
      console.error(`[signTX] 失敗`);
      reject(e);
    }
  }) 
}