const axios = require("axios");
const loginConstant = require("./constants/login.constant");
const transConstant = require("../scb/constants/transaction.constant");
const { serviceError, handleError } = require("./helpers/error.helper");
const dayjs = require("dayjs");
var qs = require('qs');

const urlScbEasy = "https://fasteasy.scbeasy.com";
const headers = {
  "cache-control": "no-cache",
  "origin": "http://ocean.isme99.com",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
  "content-type": "application/x-www-form-urlencoded"
};
const urlmain = "http://ocean.isme99.com";
const urllogin = "http://ocean.isme99.com/Public/Default11.aspx";
const urlagent_info = "http://ocean.isme99.com/AccInfo.aspx";
const urlbalance = "http://ocean.isme99.com/_Age/AccBal.aspx?role=ag";
const urlmem_info = "http://ocean.isme99.com/_Age1/MemberSet.aspx?&userName=";
const urlturnover = "http://ocean.isme99.com/_Age/SubAccsWinLoseFull.aspx?role=sa&userName=";
const urlmember = "http://ocean.isme99.com/_Age1/MemberSet.aspx";
const viewstateCon = {};
const cookieUFA = {};
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


class Ufa {

  viewStatedUFA() {
    // var config = {
    //   method: 'post',
    //   url: 'http://ocean.isme99.com/Public/Default11.aspx?lang=EN-GB',
    //   headers: {}
    // };

    return axios
      .post(`${urllogin}?lang=EN-GB`, {
        headers: {},
      })
      .then((response) => {
        let viewstate1 = response.data;
        let splitviewstate = viewstate1.split("id=\"__VIEWSTATE\" value=\"");
        let viewstate = splitviewstate[1].split("\" />\n<input type=\"hidden\" name=");
        viewstateCon.viewstate = viewstate[0];
        let viewstategen1 = viewstate[1];
        let splitviewstategen = viewstategen1.split('"__VIEWSTATEGENERATOR\" value=\"');
        let viewstateGen = splitviewstategen[1].split("\" />\n\n<input type=\"hidden\" name=\"hid_rd\"");
        viewstateCon.viewstateGen = viewstateGen[0];
        cookieUFA = response;
        return true;
      })
      .catch((error) => {
        return handleError(new serviceError(transConstant[error.message]));
      });
  }
  loginUFA = async () => {
    let checkViewState = await this.viewStatedUFA();
    if (checkViewState) {
      const params = new URLSearchParams();
      params.append('__EVENTTARGET', 'btnSignIn');
      params.append('__EVENTARGUMENT', '');
      params.append('__VIEWSTATE', viewstateCon.viewstate);
      params.append('__VIEWSTATEGENERATOR', viewstateCon.viewstateGen);
      params.append('hid_rd', '');
      params.append('txtUserName', 'Ufdwnti11');
      params.append('txtPassword', 'Tiw123456++');
      params.append('txtCode', '');
      params.append('lstLang', 'Default11.aspx?lang=EN-US');
      // var data = qs.stringify({
      //   '__EVENTTARGET': 'btnSignIn',
      //   '__EVENTARGUMENT': '',
      //   '__VIEWSTATE': viewstateCon.viewstate,
      //   '__VIEWSTATEGENERATOR': viewstateCon.viewstateGen,
      //   'hid_rd': '',
      //   'txtUserName': 'Ufdwnti11',
      //   'txtPassword': 'Tiw123456++',
      //   'txtCode': '',
      //   'lstLang': 'Default11.aspx?lang=EN-US'
      // });
      var config = {
        method: 'post',
        url: 'http://ocean.isme99.com/Public/Default11.aspx?lang=EN-GB',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "cache-control": "no-cache",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36"
          // 'Cookie':'__cf_bm=WX9aaRKBfarZKEwZHR.RwJEUz2FuEyH3vM5VVF9p5eA-1658125493-0-AamzIMM9ueTfBS1jTBNWMifumNu6Ljdl+8nwAc53XkZT9RZpTjtjM1o9z43JjOis+jN9LNeEv72geAxGKRkxAOU=; ASP.NET_SessionId=gbk2nideyrng3ut5oequkpd3;'
        },
        params
      };

      return axios(config)
        .then(function (response) {
          console.log(response);
          return response.headers;
        })
        .catch(function (error) {
          console.log(error);
        });

      // var data = qs.stringify({
      //   '__EVENTTARGET': 'btnSignIn',
      //   '__EVENTARGUMENT': '',
      //   '__VIEWSTATE': viewstateCon.viewstate,
      //   '__VIEWSTATEGENERATOR': viewstateCon.viewstateGen,
      //   'hid_rd': '',
      //   'txtUserName': 'Ufdwnti11',
      //   'txtPassword': 'Tiw123456++',
      //   'txtCode': '',
      //   'lstLang': 'Default11.aspx?lang=EN-US'
      // });

      // return axios
      //   .post(`${urllogin}?lang=EN-GB`, data, {
      //     headers: {
      //       'Content-Type': 'application/x-www-form-urlencoded',
      //     },
      //   })
      //   .then((response) => {
      //     console.log(response);

      //     return response.data;
      //   })
      //   .catch((error) => {
      //     return handleError(new serviceError(transConstant[error.message]));
      //   });
    } else {
      return false;
    }
  }




}

module.exports = Ufa;
