const controllerLotto = require('../controllers/lotto.controller');

module.exports = (app) => {
    app.get('/Logs', controllerLotto.testLogsFile);
    app.post('/testFunc', controllerLotto.testFunc);
    app.post('/ApiGetStockListLotto', controllerLotto.ApiGetStockListLotto);
    app.post('/ApiGetBalanceUser', controllerLotto.ApiGetBalanceUser);
    app.post('/memberLogin', controllerLotto.memberLogin);
    app.post('/ApiCheckRateNumber', controllerLotto.ApiCheckRateNumber);
    app.post('/ApiCheckRateNumberAgain', controllerLotto.ApiCheckRateNumberAgain);
    app.post('/ApiInsertNumber', controllerLotto.ApiInsertNumber);
    app.post('/ApiUpdateLottoSetting', controllerLotto.ApiUpdateLottoSetting);
    app.post('/ApiQueryLottoGroupType', controllerLotto.ApiQueryLottoGroupType);
    app.post('/ApiHistoryAward', controllerLotto.ApiHistoryAward);
    app.post('/ApiHistoryBetOrder', controllerLotto.ApiHistoryBetOrder);
    app.post('/ApiHistoryBetOrderDetail', controllerLotto.ApiHistoryBetOrderDetail);
    app.post('/ApiQueryLottoLimitMin', controllerLotto.ApiQueryLottoLimitMin);

    app.post('/ApiGetLottoNumberGroup', controllerLotto.ApiGetLottoNumberGroup);
    app.post('/ApiGetLottoNumberDetail', controllerLotto.ApiGetLottoNumberDetail);
    app.post('/ApiQueryLottoGroupTypeWait', controllerLotto.ApiQueryLottoGroupTypeWait);



}