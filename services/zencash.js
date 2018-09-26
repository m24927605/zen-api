const rp = require('request-promise');
const zencashjs = require('zencashjs');
const math = require('mathjs');
/** 取得Unspent
 *  @param {string} url
 */
const APIRequest = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      let err = '';
      const zensystemOptions = {
        uri: `https://explorer.zensystem.io/api/${url}`,
        resolveWithFullResponse: true,
        json: true
      }
      const zensystemResult = rp.get(zensystemOptions);
      const zensolutionsOptions = {
        uri: `https://explorer.zen-solutions.io/api/${url}`,
        resolveWithFullResponse: true,
        json: true
      }
      const zensolutionsResult = rp.get(zensolutionsOptions);

      let resultArray = await Promise.all([zensystemResult, zensolutionsResult]);
      resultArray.forEach((item) => {
        if (item.statusCode === 200 && item.headers['content-type'].includes('application/json')) {
          resolve(item.body);
        }
        else {
          err = 'all api failed';
        }
      });
      console.log(err)
      if (err) {
        throw new Error(err);
      }
    } catch (e) {
      console.error(`[APIRequest] 失敗 ${e}`);
      reject(e);
    }
  })
}

/** 取得Unspent
 *  @param {string} address
 */
exports.getUnspent = (address) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`${address}查詢 unspent`)
      const url = `addr/${address}/utxo`;
      const result = await APIRequest(url);
      resolve(result);
    } catch (e) {
      console.error(`地址：${address} [getUnspent] 失敗`);
      reject(e);
    }
  });
}

/** 取得所有Unspent的satoshis 加總
 *  @param {array} unspentArray
 */
exports.getUnspentTotalAmount = (unspentArray) => {
  return new Promise( (resolve, reject) => {
    try {
      let sum=0;
      unspentArray.forEach((item)=>{
        sum+=item.satoshis;
      })
      resolve(sum);
    } catch (e) {
      console.error(`[getUnspentTotalAmount] 失敗`);
      reject(e);
    }
  });
}

/** 決定要付給礦工的fee
 *  @param {number} blocks
 */
exports.determinePayFee = (blocks) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `utils/estimatefee?nbBlocks=${blocks}`;
      const result = await APIRequest(url);
      resolve(result[blocks] * 10*100000000);
    } catch (e) {
      console.error(`[determinePayFee] 失敗`);
      reject(e);
    }
  });
}
/** 取得最新的BlockHash
 *  
 */
exports.getLatestBlockHash = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `status?q=getLastBlockHash`;
      const result = await APIRequest(url);
      resolve(result['lastblockhash']);
    } catch (e) {
      console.error(`[getLatestBlockHash] 失敗`);
      reject(e);
    }
  });
}
/** 取得最新的BlockHeight
 *  @param {string} blockHash
 */
exports.getBlockHeight = (blockHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `block/${blockHash}`;
      const result = await APIRequest(url);
      resolve(result['height']);
    } catch (e) {
      console.error(`[getBlockHeight] 失敗`);
      reject(e);
    }
  });
}
/** 確認所要支付的Amount大於fee
 *  @param {array} unspentArray 
 *  @param {number} payFee
 */
exports.checkAmountBigthanFee = (unspentArray, payFee) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isBig = false;
      let sum = 0;
      for (let unspentItem of unspentArray) {
        sum = math.eval(`${sum} + ${unspentItem.amount}`);
      }
      let toAmount = math.eval(`${sum} - ${payFee}`);
      (toAmount > 0) ? isBig = true : isBig = false;
      resolve(isBig);
    } catch (e) {
      console.error(`[checkAmountBigthanFee] 失敗`);
      reject(e);
    }
  })
}
/** 組私鑰簽章
 *  @param {array} unspentArray 
 *  @param {string} nowBlockHash
 *  @param {number} nowBlockHeight
 *  @param {number} sendAmountSatoshis
 *  @param {string} receiverAddress
 *  @param {string} message
 *  @param {string} priKey
 */
exports.signTX = (unspentArray, nowBlockHash, nowBlockHeight, sendAmountSatoshis, receiverAddress, message, priKey) => {
  return new Promise(async (resolve, reject) => {
    try {
      const txobj = zencashjs.transaction.createRawTx(
        unspentArray,
        [{ address: receiverAddress, satoshis: sendAmountSatoshis }],
        nowBlockHeight,
        nowBlockHash
      );

      const compressPubKey = true;
      const SIGHASH_ALL = 1;
      const signedobj = zencashjs.transaction.signTx(txobj, 0, priKey, compressPubKey, SIGHASH_ALL);
      const signed_serialized = zencashjs.transaction.serializeTx(signedobj);
      resolve(signed_serialized);
    } catch (e) {
      console.error(`[signTX] 失敗`);
      reject(e);
    }
  })
}

exports.pushTX=(rawTX)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const postOptions = {
        method: 'POST',
        uri: 'https://explorer.zensystem.io/api/tx/send',
        body: {
          rawtx: rawTX
        },
        json: true
      };
      let result= await rp(postOptions);
      resolve(result);
    } catch (e) {
      console.error(`[pushTX] 失敗`);
      reject(e);
    }
  })
}