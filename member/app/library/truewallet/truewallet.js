const axios = require("axios");
const loginConstant = require("./constants/login.constant");
const transConstant = require("../scb/constants/transaction.constant");
const { serviceError, handleError } = require("./helpers/error.helper");
const dayjs = require("dayjs");
var qs = require('qs');

/**========================================================== *
const deviceId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const pin = "xxxxxx";
const account = "4301171891";
/**========================================================== */
const urlTrueWalletGateway = "https://api.truewallet.me/";
const urlTrueWalletGatewayTMN = "https://apitrue.ufabetss86.com";
const path = "v2.php";
const phoneNumber1 = '';
const Pass = '';
const Pin = '';
class Truewallet {
  constructor(phoneNumber, Pass, Pin) {
    if (phoneNumber) this.phoneNumber1 = phoneNumber;
    if (Pass) this.Pass = Pass;
    if (Pin) this.Pin = Pin;
  }


  RequestLoginOTP = async (data) => {
    var data = JSON.stringify({
      "username": data.phone,
      "password": data.pass,
      "pin": data.pin,
      "data": {
        "type": "RequestLoginOTP"
      }
    });
    var config = {
      method: 'post',
      url: urlTrueWalletGateway + 'v2otp.php',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };
  SubmitOTP = async (data) => {
    var data = JSON.stringify({
      "username": data.phone,
      "password": data.pass,
      "pin": data.pin,
      "data": {
        "type": "SubmitLoginOTP",
        "otp": data.otp,
        "ref": data.ref
      }
    });
    var config = {
      method: 'post',
      url: urlTrueWalletGateway + 'v2otp.php',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };

  // ApiTruewallet = async (data) => {
  //   var data = JSON.stringify({
  //     "username": data.phone,
  //     "password": data.pass,
  //     "pin": data.pin,
  //     "data": {
  //       "type": data.type
  //     }
  //   });
  //   var config = {
  //     method: 'post',
  //     url: urlTrueWalletGateway + path,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: data
  //   };
  //   return axios(config)
  //     .then(function (response) {
  //       return response.data;
  //     })
  //     .catch(function (error) {
  //       return error;
  //     });
  // };

  ApiTruewallet = async (data) => {
    var data = qs.stringify({
      "token": data.token
    });
    var config = {
      method: 'post',
      url: `${urlTrueWalletGatewayTMN}/api/balance.php`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      data: data
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };

  ApiCheckName = async (data) => {
    var config = {
      method: 'get',
      url: urlTrueWalletGateway + 'iden.php?phone=' + data.phone + '&pin=' + data.pin + '&ref=' + data.ref + '&type=' + data.type,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };

  // ApiTransfer = async (data) => {
  //   var data = JSON.stringify({
  //     "username": data.phone,
  //     "password": data.pass,
  //     "pin": data.pin,
  //     "data": {
  //       "type": data.type,
  //       "ref": data.ref,
  //       "amount": data.amount
  //     }
  //   });
  //   var config = {
  //     method: 'post',
  //     url: urlTrueWalletGateway + path,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: data
  //   };
  //   return axios(config)
  //     .then(function (response) {
  //       return response.data;
  //     })
  //     .catch(function (error) {
  //       return error;
  //     });
  // };

  ApiTransfer = async (data) => {
    var data = qs.stringify({
      "phone": data.ref,
      "amount": data.amount,
      "token": data.token
    });
    var config = {
      method: 'post',
      url: `${urlTrueWalletGatewayTMN}/api/transfer.php`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      data: data
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };

  ApiLogin = async () => {
    var config = {
      method: 'get',
      url: `${urlTrueWalletGatewayTMN}/api/login.php`,
    };
    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error;
      });
  };
}

module.exports = Truewallet;
