const fetch = require("node-fetch");
const readlineSync = require("readline-sync");
const { URLSearchParams } = require('url');
const fs = require("async-file");
const chalk = require('chalk');
const API_URL = 'http://yarzc0de.co.id/gopay/api.php';

const getDetailAccount = (key) => new Promise((resolve,reject) =>
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'CheckInfo');
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});

const getAllTuyul = (key) => new Promise((resolve,reject) =>
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'allTuyul');
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});

const redeemByWeb = (key,code,token) => new Promise((resolve,reject) =>
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'redeembyCustom');
    params.append('code', code);
    params.append('token', token);
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});

const redeemByWebBatch = (key,batch,token) => new Promise((resolve,reject) =>
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'redeembyBatch');
    params.append('batchId', batch);
    params.append('token', token);
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});

const getMerchantDetails = (key,merchantId,token) => new Promise((resolve,reject) =>
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'getMerchant');
    params.append('merchantId', merchantId);
    params.append('token', token);
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});

const PayToMerchant = (key,token,merchant_ref_id,merchant_name,quantity,pin) => new Promise((resolve,reject) => 
{
    const params = new URLSearchParams();
    params.append('api_key', key);
    params.append('type', 'PaytoMerchant');
    params.append('merchant_ref_id', merchant_ref_id);
    params.append('merchant_exname', merchant_name);
    params.append('quantity', quantity);
    params.append('pin', pin);
    params.append('token', token);
    fetch(API_URL, {
        method: 'POST',
        body: params
    })
    .then(res => res.json())
    .then(result => {
        resolve(result)
    })
    .catch(err => {
        reject(err)
    })
});


(async () => {
    try
    {
        const apiKey = await readlineSync.question("API-KEY: ");
        const dataAkun = await getDetailAccount(apiKey);
        if(dataAkun.success === true)
        {
            if(dataAkun.data.tuyul_account < 1)
            {
                console.log(chalk`{bold.red Anda harus mempunyai akun tuyul sebelum menggunakan tools ini.}`);
                process.exit(1);
            }
            console.log("=========== Account Information ==================");
            console.log("Username : "+dataAkun.data.username);
            console.log("Sisa Coin : "+dataAkun.data.coin);
            console.log("Akun tuyul : " + dataAkun.data.tuyul_account +" Akun");
            console.log("=========== Account Information ==================");
            console.log("Menu saat ini:\n[1] Get All Tuyul's Account \n[2] Export All Tuyul's Account to Txt \n[3] Mass Redeem All Account (Get From Web)\n[4] Mass Redeem by Batch ID [Get Account from Web]\n[5] Mass Transfer to Merchant");
            const menuPilihan = await readlineSync.question("Menu? ");
            if(menuPilihan == 1)
            {
                const tuyulList = await getAllTuyul(apiKey);
                if(tuyulList.success === true)
                {
                    let i = 1;
                    tuyulList.data.forEach(function(sesuatu)
                    {
                        const splitting = sesuatu.split("|");
                        const phone = splitting[0];
                        const token = splitting[1];
                        console.log(+i+ ". " +phone+" ");
                        i++;
                    });
                } else {
                    console.log("Error : "+ tuyulList.msg +"");
                }
            } else if(menuPilihan == 2)
            {
                const saveFiles = await readlineSync.question("File to save (txt)? ");
                const tuyulList = await getAllTuyul(apiKey);
                if(tuyulList.success === true)
                {
                    let i = 1;
                    tuyulList.data.forEach(function(sesuatu)
                    {
                        const splitting = sesuatu.split("|");
                        const phone = splitting[0];
                        const token = splitting[1];
                        fs.appendFile(
                            `${saveFiles}`,
                            `${phone}|${token}\n`,
                            "utf-8"
                        );                            
                        console.log(chalk`${i}. ${phone} {bold.green Saved on ${saveFiles} }`);
                        i++;
                    });
                } else {
                    console.log("Error : "+ tuyulList.msg +"");
                }
            } else if(menuPilihan == 3)
            {
                const codePromo = await readlineSync.question("Promo Code? ");
                const tuyulList = await getAllTuyul(apiKey);
                if(tuyulList.success === true)
                {
                    let i = 1;
                    console.log();
                    await tuyulList.data.forEach(async function(sesuatu)
                    {
                        const splitting = sesuatu.split("|");
                        const phone = splitting[0];
                        const token = splitting[1];
                        const redeems = await redeemByWeb(apiKey,codePromo,token);
                        if(redeems.success === true)
                        {
                            console.log(chalk`${i}. ${phone} {bold.green ${redeems.msg} }`);
                        } else {
                            console.log(chalk`${i}. ${phone} {bold.red ${redeems.msg} }`);
                        }                    
                        i++;
                    });
                } else {
                    console.log("Error : "+ tuyulList.msg +"");
                }
            } else if(menuPilihan == 4)
            {
                const batchId = await readlineSync.question("Batch ID? ");
                const tuyulList = await getAllTuyul(apiKey);
                if(tuyulList.success === true)
                {
                    let i = 1;
                    console.log();
                    await tuyulList.data.forEach(async function(sesuatu)
                    {
                        const splitting = sesuatu.split("|");
                        const phone = splitting[0];
                        const token = splitting[1];
                        const redeems = await redeemByWebBatch(apiKey,batchId,token);
                        if(redeems.success === true)
                        {
                            console.log(chalk`${i}. ${phone} {bold.green ${redeems.msg} }`);
                        } else {
                          //  console.log(redeems);
                            console.log(chalk`${i}. ${phone} {bold.red ${redeems.msg} }`);
                        }                    
                        i++;
                    });
                } else {
                    console.log("Error : "+ tuyulList.msg +"");
                }
            } else if(menuPilihan == 5)
            {
                const merchantId = await readlineSync.question("Merchant ID? ");
                const quantity   = await readlineSync.question("Jumlah? ");
                const saveOn = await readlineSync.question("Save on? ");
                const tuyulList = await getAllTuyul(apiKey);
                if(tuyulList.success === true)
                {
                    let i = 1;
                    console.log();
                    await tuyulList.data.forEach(async function(sesuatu)
                    {
                        const splitting = sesuatu.split("|");
                        const phone = splitting[0];
                        console.log(chalk`Using Number -> {bold.green ${phone} }`);
                        const token = splitting[1];
                        const getDetail = await getMerchantDetails(apiKey,merchantId,token);
                        if(getDetail.success === true)
                        {
                            const pin = await readlineSync.question("PIN? ");
                            const paytoWin = await PayToMerchant(apiKey,token,getDetail.data.merchant_ref_id, getDetail.data.external_name, quantity, pin);
                            if(paytoWin.success == true)
                            {
                                await fs.appendFile(
                                    `${saveOn}`,
                                    `${phone}|${paytoWin.data.transaction_ref}\n`,
                                    "utf-8"
                                );            
                                console.log(chalk`${i}. ${phone} {bold.green Transaksi berhasil, transaksi ID: ${paytoWin.data.transaction_ref}} (Saved on ${saveOn})`);
                            } else {
                                console.log(chalk`${i}. ${phone} {bold.red ${getDetail.msg} }`);
                            }
                        } else {
                            console.log(chalk`${i}. ${phone} {bold.red ${getDetail.msg} }`);
                        }                    
                        i++;
                    });
                } else {
                    console.log("Error : "+ tuyulList.msg +"");
                }
            }
        } else {
            console.log("Error : " + dataAkun.msg + "");
        }
    } catch(e)
    {
        console.log(e);
    }
})();