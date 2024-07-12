const axios = require("axios");
const baseUrl = process.env.URL_LOTTO_HOUSE;
const { serviceError, handleError } = require("./helpers/error.helper");
class LottoHouse {

    constructor(username, password) {
        if (username) this.username = username;
        if (password) this.password = password;
    }


    memberLogin = async(username, password) => {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        return axios
            .post(`${baseUrl}/api/authication`, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                const { token } = response.data;
                return token;
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    }


    authLottoHouse = async() => {
        const params = new URLSearchParams();
        params.append("username", this.username);
        params.append("password", this.password);
        return axios
            .post(`${baseUrl}/api/authication`, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                // console.log(response);
                const { token } = response.data;
                return token;
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    }

    apiLottoRewardLottoHouse = async() => {
        const authToken = await this.authLottoHouse()
        const params = new URLSearchParams();
        return axios
            .get(`${baseUrl}/api/cli_lotto_award_result`, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    }

    registerLottoHouse = async(username) => {
        const authToken = await this.authLottoHouse()
        const params = new URLSearchParams();
        params.append("mode", "create");
        params.append("username", username);
        return axios
            .post(`${baseUrl}/api/register`, params, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                const { token } = response.data;
                return token;
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    }

    addCreditLottoHouse = async(amount, username) => {

        const authToken = await this.authLottoHouse()

        const params2 = new URLSearchParams();
        params2.append("mode", "deposit-credit");
        params2.append("username_deposit_credit", username);
        params2.append("credit_amount", amount);
        params2.append("username_withdraw_credit", "anlt01");

        return axios
            .post(`${baseUrl}/api/user-credit`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then(function(res) {
                return res
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    };

    withdrawCreditLottoHouse = async(amount, username) => {

        const authToken = await this.authLottoHouse()

        const params2 = new URLSearchParams();
        params2.append("mode", "withdraw-credit");
        params2.append("username_withdraw_credit", username);
        params2.append("credit_amount", amount);

        return axios
            .post(`${baseUrl}/api/user-credit`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then(function(res) {
                return res
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    };

    checkCreditLottoHouse = async(username) => {

        const authToken = await this.authLottoHouse()

        const params2 = new URLSearchParams();
        params2.append("mode", "check-credit");
        params2.append("username", username);


        return axios
            .post(`${baseUrl}/api/user-credit`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then(function(res) {
                return res
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    };

    reportWinLost = async(data) => {
        const { startDate, endDate } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();
        params2.append("start_date", startDate);
        params2.append("end_date", endDate);


        return axios
            .post(`${baseUrl}/api/report-winlost`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    };

    reportPlayer = async(data) => {
        const { startDate, endDate } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();
        params2.append("start_date", startDate);
        params2.append("end_date", endDate);

        return axios
            .post(`${baseUrl}/api/report-player`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                return handleError(new serviceError(error));
            });
    };

    reportLottoSummary = async(data) => {
        const { lottoDate, modeType } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();
        params2.append("lotto_date", lottoDate);
        params2.append("mode_type", modeType);

        return axios
            .post(`${baseUrl}/api/report-lotto-summary`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoSummaryCategory = async(data) => {
        const { lottoDate, lottoGroupId, lottoType, modeType } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();

        params2.append("lotto_date", lottoDate);
        params2.append("lotto_group_id", lottoGroupId);
        params2.append("lotto_type", lottoType);
        params2.append("mode_type", modeType);

        return axios
            .post(`${baseUrl}/api/report-lotto-summary-category`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoSummaryNumber = async(data) => {
        const { lottoDate, lottoGroupId, lottoType, modeType, flag } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();

        params2.append("lotto_date", lottoDate);
        params2.append("lotto_group_id", lottoGroupId);
        params2.append("lotto_type", lottoType);
        params2.append("mode_type", modeType);
        params2.append("flag", flag);

        return axios
            .post(`${baseUrl}/api/report-lotto-summary-number`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoSummaryMember = async(data) => {
        const { lottoDate, lottoGroupId, lottoType, modeType } = data
        const authToken = await this.authLottoHouse()
        const params2 = new URLSearchParams();

        params2.append("lotto_date", lottoDate);
        params2.append("lotto_group_id", lottoGroupId);
        params2.append("lotto_type", lottoType);
        params2.append("mode_type", modeType);

        return axios
            .post(`${baseUrl}/api/report-lotto-summary-member`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoSetting = async(_) => {

        const authToken = await this.authLottoHouse()
        return axios
            .post(`${baseUrl}/api/report-lotto-setting`, {}, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoSettingManage = async(data) => {

        const { lottoType } = data
        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        params2.append("lotto_type_id", lottoType);

        return axios
            .post(`${baseUrl}/api/report-lotto-setting-manage`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoAlliance = async(_) => {

        const authToken = await this.authLottoHouse()

        return axios
            .post(`${baseUrl}/api/report-lotto-alliance`, {}, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    reportLottoAllianceSettingBonus = async(_) => {

        const authToken = await this.authLottoHouse()

        return axios
            .post(`${baseUrl}/api/report-lotto-alliance-settingbonus`, {}, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };


    updateLottoAllianceSettingBonus = async(data) => {

        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        data.forEach((item) => {
            params2.append(item.name, item.value);
        })
        return axios
            .post(`${baseUrl}/api/update-lotto-alliance-settingbonus`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    updateLottoSetting = async(data) => {

        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        data.forEach((item) => {
            params2.append(item.name, item.value);
        })

        return axios
            .post(`${baseUrl}/api/update-lotto-setting`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };

    // บันทึกและอัพเดท เลขอั้น id = 0 คือ เพิ่มใหม่ id = 1 อัพเดท
    updateLottoDeprive = async(data) => {

        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        params2.append('data[lotto_type]', data.lotto_type);
        params2.append('data[lotto_date]', data.lotto_date);
        params2.append('data[lotto_reward_type]', data.lotto_reward_type);
        params2.append('data[number]', data.number);
        params2.append('data[reward]', data.reward);
        params2.append('id', data.id);

        return axios
            .post(`${baseUrl}/api/lotto-limit-update`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };
    // ดึงรายการ เลขอั้น 
    getLottoDeprive = async(data) => {

        const { lottoType, lottoDate } = data
        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        params2.append("lotto_type", lottoType);
        params2.append("lotto_date", lottoDate);

        return axios
            .post(`${baseUrl}/api/lotto-limit`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };
    // ดึงรายการ วันที่งวด เลขอั้น 
    getLottoDate = async(data) => {

        const { lottoType } = data
        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        params2.append("lotto_type", lottoType);

        return axios
            .post(`${baseUrl}/api/lotto-date`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };
    // ลบรายการ วันที่งวด เลขอั้น
    getLottoDestroy = async(data) => {

        const { id } = data
        const authToken = await this.authLottoHouse()
        let params2 = new URLSearchParams();
        params2.append("id", id);

        return axios
            .post(`${baseUrl}/api/lotto-limit-destory`, params2, {
                headers: {
                    Authorization: "Bearer " + authToken,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                return response.data
            })
            .catch((error) => {
                console.log(error);
                return handleError(new serviceError(error));
            });
    };


}

module.exports = LottoHouse;