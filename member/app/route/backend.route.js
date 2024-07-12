const controllerMember = require("../controllers/backend.controller");
const walletControllrt = require("../controllers/wallet.controller");
const refController = require("../controllers/ref.controller");
const controllerLotto = require("../controllers/lotto.controller");

function handleAuthRoute(req, res, next) {
    controllerMember.handleAuth(req, res, next);
}

function handleAuthRouteMember(req, res, next) {
    controllerMember.handleAuthMember(req, res, next);
}

function handleAuthRouteRef(req, res, next) {
    refController.handleAuth(req, res, next);
}

module.exports = (app) => {
    app.get("/Test", controllerMember.ApiGetBalanceWallet2);
    app.post("/ApiUpload", controllerMember.upload);
    app.get("/ApiUploaddel", controllerMember.delupload);
    app.post("/gitpull", controllerMember.gitpull);
    app.get("/pm2restart", controllerMember.pm2restart);
    app.get("/view-logs", controllerMember.Logs);
    app.get("/testufa", controllerMember.testufa);

    app.post("/checkCreditLotto", walletControllrt.testCredit);
    app.post("/testToken", controllerMember.testToken);
    app.post("/Login", controllerMember.Login);
    app.post("/createSite", controllerMember.createSite);
    app.post('/ApiChangePass', controllerMember.ApiChangePass);

    //######################################## NAV BAR ########################################
    app.post("/Apinav", controllerMember.Apinav);
    //######################################## NAV BAR ########################################

    //######################################## Dashboard ########################################
    app.post("/Apidashboard", controllerMember.Apidashboard);
    app.post("/ApiSettingDashboard", controllerMember.ApiSettingDashboard);
    app.post(
        "/ApiupdateGeneralSetting",
        controllerMember.ApiupdateGeneralSetting
    );
    app.post("/ApiupdateAutoSetting", controllerMember.ApiupdateAutoSetting);
    app.post("/ApiupdateNotifySetting", controllerMember.ApiupdateNotifySetting);
    //######################################## Dashboard ########################################

    //######################################## Member ########################################
    app.post("/Apiquerymember", controllerMember.Apiquerymember);
    app.post("/ApiquerymemberByUser", controllerMember.ApiquerymemberByUser);
    app.post("/ApiquerymemberWarning", controllerMember.ApiquerymemberWarning);
    app.post("/ApiqueryAddWarning", controllerMember.ApiqueryAddWarning);
    app.post("/ApiqueryUpdateWarning", controllerMember.ApiqueryUpdateWarning);
    app.post("/Apiquerynewmember", controllerMember.ApiqueryNewmember);
    app.post("/ApiquerymemberUFA", controllerMember.ApiquerymemberUFA);
    app.post("/ApideleteMember", controllerMember.ApideleteMember);
    app.post("/ApiqueryeMember", controllerMember.ApiqueryeMember);
    app.post("/ApiupdateMember", controllerMember.ApiupdateMember);
    app.post(
        "/ApiupdatePlayPowyingshup",
        controllerMember.ApiupdatePlayPowyingshup
    );
    app.post("/ApiviewCreditUserUFA", controllerMember.ApiviewCreditUserUFA);
    app.post("/ApimanageCredit", controllerMember.ApimanageCredit);
    app.post("/ApiaddCredit", controllerMember.ApiaddCredit);
    app.post("/ApiminusCredit", controllerMember.ApiminusCredit);
    app.post(
        "/ApiregisterMemberManual",
        controllerMember.ApiregisterMemberManual
    );
    //######################################## Member ########################################

    //######################################## Promotion ########################################
    app.post("/ApiqueryePromotion", controllerMember.ApiqueryePromotion);
    app.post("/ApiupdatePromotion", controllerMember.ApiupdatePromotion);
    app.post(
        "/ApiqueryePromotionHistory",
        controllerMember.ApiqueryePromotionHistory
    );
    //######################################## Promotion ########################################

    //######################################## Deposit History ########################################
    app.post(
        "/ApiqueryeDepositHistory",
        controllerMember.ApiqueryeDepositHistory
    );
    app.post(
        "/ApiqueryeUnHistoryDepositHistory",
        controllerMember.ApiqueryeUnHistoryDepositHistory
    );
    app.post(
        "/ApiAddCreditUnSuccessDeposit",
        controllerMember.ApiAddCreditUnSuccessDeposit
    );

    //######################################## Deposit History ########################################

    //######################################## Withdraw History ########################################
    app.post(
        "/ApiqueryeWithdrawHistory",
        controllerMember.ApiqueryeWithdrawHistory
    );
    //######################################## Withdraw History ########################################

    //########################################  History ########################################

    app.post("/ApicheckBalanceBank", controllerMember.ApicheckBalanceBank);
    // app.post("/checkBank", controllerMember.checkBank);//Old
    app.post("/checkBank", controllerMember.BankVerify);
    //########################################  History ########################################

    //######################################## Withdraw ########################################
    app.post("/ApiwithdrawUserAuto", controllerMember.ApiwithdrawUserAuto);
    app.post(
        "/ApiupdateStatusWithdraw",
        controllerMember.ApiupdateStatusWithdraw
    );
    app.post(
        "/ApiupdateUnStatusWithdraw",
        controllerMember.ApiupdateUnStatusWithdraw
    );
    app.post(
        "/ApiqueryWithdrawSuccess",
        controllerMember.ApiqueryWithdrawSuccess
    );
    app.post(
        "/ApiqueryWithdrawUnSuccess",
        controllerMember.ApiqueryWithdrawUnSuccess
    );
    app.post("/ApicheckStatusSCB", controllerMember.ApicheckStatusSCB);

    //######################################## Withdraw ########################################

    //######################################## Result ########################################
    app.post("/ApiqueryResult", controllerMember.ApiqueryResult);
    //######################################## Result ########################################

    app.post(
        "/ApiQuerySettingTruewallet",
        controllerMember.ApiQuerySettingTruewallet
    );
    app.post(
        "/ApiUpdateSettingTruewallet",
        controllerMember.ApiUpdateSettingTruewallet
    );
    app.post("/ApiExchangeTransfer", controllerMember.ApiExchangeTransfer);

    //######################################## Report Withdraw ########################################
    app.post("/ApiqueryWithdrawReport", controllerMember.ApiqueryWithdrawReport);
    app.post(
        "/ApiqueryWithdrawAutoReport",
        controllerMember.ApiqueryWithdrawAutoReport
    );
    //######################################## Report Withdraw ########################################

    //######################################## Report Deposit ########################################
    app.post("/ApiqueryDepositReport", controllerMember.ApiqueryDepositReport);
    //######################################## Report Deposit ########################################

    //######################################## Report Finance ########################################
    app.post("/ApiqueryFinanceReport", controllerMember.ApiqueryFinanceReport);
    //######################################## Report Finance ########################################

    //######################################## Transaction Manual ########################################
    app.post(
        "/ApiqueryTransactionManual",
        controllerMember.ApiqueryTransactionManual
    );
    app.post("/ApiQueryTransactionAll", controllerMember.ApiqueryTransactionAll);
    //######################################## Transaction Manual ########################################

    //######################################## STAFF ########################################
    app.post("/ApiqueryStaff", controllerMember.ApiqueryStaff);
    app.post("/ApiaddStaff", controllerMember.ApiaddStaff);
    app.post("/ApideleteStaff", controllerMember.ApideleteStaff);
    app.post("/ApiqueryStaffByID", controllerMember.ApiqueryStaffByID);
    app.post("/ApiupdateStaff", controllerMember.ApiupdateStaff);

    //######################################## STAFF ########################################

    //######################################## STAFF HISTORY ########################################
    app.post("/ApiqueryeStaffHistory", controllerMember.ApiqueryeStaffHistory);
    //######################################## STAFF HISTORY ########################################

    //######################################## SETTING WHEE HISTORY ########################################
    app.post("/ApiqueryeSettingWheel", controllerMember.ApiqueryeSettingWheel);
    app.post("/ApiupdateSetting_w", controllerMember.ApiupdateSetting_w);
    app.post("/ApiupdateSettingWheel", controllerMember.ApiupdateSettingWheel);
    //######################################## SETTING WHEE HISTORY ########################################

    //######################################## SETTING BANNER ########################################
    app.post("/ApiUpdateSettingBanner", controllerMember.ApiUpdateSettingBanner);
    app.post("/ApiQuerySettingBanner", controllerMember.ApiQuerySettingBanner);
    app.post("/ApiUpdateSettingPopup", controllerMember.ApiUpdateSettingPopup);
    app.post("/ApiQuerySettingPopup", controllerMember.ApiQuerySettingPopup);
    app.post("/ApiUpdateSettingVip", controllerMember.ApiUpdateSettingVip);
    app.post("/ApiQuerySettingVip", controllerMember.ApiQuerySettingVip);
    app.post("/ApiUpdateSettingDoc", controllerMember.ApiUpdateSettingDoc);
    app.post("/ApiQuerySettingDoc", controllerMember.ApiQuerySettingDoc);
    app.post("/ApiDeleteDataImg", controllerMember.ApiDeleteDataImg);
    //######################################## SETTING BANNER ########################################

    //######################################## Report Wheel ########################################
    app.post("/ApiqueryWheelReport", controllerMember.ApiqueryWheelReport);
    //######################################## Report Wheel ########################################

    //######################################## SETTING POWYINGSHUP ########################################
    app.post(
        "/ApiquerySettingPowYingShup",
        controllerMember.ApiquerySettingPowYingShup
    );
    app.post("/ApiupdatePowYingShup", controllerMember.ApiupdatePowYingShup);
    //######################################## SETTING POWYINGSHUP ########################################

    //######################################## Report POWYINGSHUP ########################################
    app.post(
        "/ApiqueryPowYingShupReport",
        controllerMember.ApiqueryPowYingShupReport
    );
    //######################################## Report POWYINGSHUP ########################################

    //######################################## Alliance ########################################
    app.post("/ApiaddAlliance", controllerMember.ApiaddAlliance);
    app.post("/ApiqueryAlliance", controllerMember.ApiqueryAlliance);
    app.post("/ApiqueryDetailAlliance", controllerMember.ApiqueryDetailAlliance);
    app.post("/ApiaddAllianceLog", controllerMember.ApiaddAllianceLog);
    app.post("/ApiqueryAllianceLog", controllerMember.ApiqueryAllianceLog);
    app.post("/ApiqueryAllianceByID", controllerMember.ApiqueryAllianceByID);
    app.post(
        "/ApideleteMemberAlliance",
        controllerMember.ApideleteMemberAlliance
    );
    app.post(
        "/ApiupdateMemberAlliance",
        controllerMember.ApiupdateMemberAlliance
    );

    //######################################## Alliance ########################################
    app.post("/ApiqueryTurnover", controllerMember.ApiqueryTurnover);

    //######################################## Member Partner ########################################
    app.post("/ApiGetMember", handleAuthRoute, controllerMember.getMember);
    app.post(
        "/ApiMemberPartner",
        handleAuthRoute,
        controllerMember.memberPartner
    );
    app.post(
        "/ApiDataMemberPartner",
        handleAuthRoute,
        controllerMember.dataTableMemberPartner
    );
    app.post(
        "/ApiChildrenMemberPartner",
        handleAuthRoute,
        controllerMember.getChildrenMemberPartner
    );
    app.post(
        "/ApiDeleteMemberPartner",
        handleAuthRoute,
        controllerMember.deleteMemberPartner
    );
    app.post(
        "/ApiDataMemberPartnerType",
        controllerMember.getDataMemberPartnerType
    );

    app.post(
        "/ApiMemberPartnerList",
        handleAuthRoute,
        controllerMember.getMemberPartnerList
    );
    app.post(
        "/ApiMemberPartnerListOld",
        handleAuthRoute,
        controllerMember.getMemberPartnerListOld
    );
    app.post(
        "/ApiMemberPartnerListYod",
        handleAuthRoute,
        controllerMember.getMemberPartnerListYod
    );
    app.post("/ApiTranferYod", handleAuthRoute, controllerMember.TranferYod);
    app.post("/ApiCheckRemark", handleAuthRoute, controllerMember.getGetRemark);
    app.post(
        "/ApiDataAffCasino",
        handleAuthRoute,
        controllerMember.dataAffCasino
    );
    app.post("/ApiSetAffCasino", handleAuthRoute, controllerMember.setAffCasino);
    //######################################## Member Partner ########################################

    app.post("/ApiqueryPromotion", controllerMember.ApiqueryPromotion);
    app.post("/ApiqueryPromotionByID", controllerMember.ApiqueryPromotionByID);
    app.post(
        "/ApiqueryPromotionEditByID",
        controllerMember.ApiqueryPromotionEditByID
    );
    app.post("/ApiupdatePromotionbyID", controllerMember.ApiupdatePromotionbyID);
    app.post("/ApideletePromotion", controllerMember.ApideletePromotion);
    app.post("/ApiaddPromotion", controllerMember.ApiaddPromotion);
    app.post("/ApiqueryPromotionType", controllerMember.ApiqueryPromotionType);

    app.post("/ApiqueryAccountDeposit", controllerMember.ApiqueryAccountDeposit);
    app.post(
        "/ApiqueryAccountWithdraw",
        controllerMember.ApiqueryAccountWithdraw
    );

    app.post(
        "/ApiupdateAccountDeposit",
        controllerMember.ApiupdateAccountDeposit
    );
    app.post(
        "/ApiupdateAccountWithdraw",
        controllerMember.ApiupdateAccountWithdraw
    );

    app.post(
        "/ApiupdateAccountDepositDetail",
        controllerMember.ApiupdateAccountDepositDetail
    );
    app.post(
        "/ApiupdateAccountWithdrawDetail",
        controllerMember.ApiupdateAccountWithdrawDetail
    );

    app.post("/ApideleteDeopsit", controllerMember.ApideleteDeopsit);
    app.post("/ApideleteWithdraw", controllerMember.ApideleteWithdraw);

    app.post("/ApiaddDeposit", controllerMember.ApiaddDeposit);
    app.post("/ApiaddWithdraw", controllerMember.ApiaddWithdraw);

    app.post("/ApiGetBank", controllerMember.ApiGetBank);
    app.post("/ApiquerymemberSel", controllerMember.ApiquerymemberSel);
    app.post("/ApiReportMemberTopup", controllerMember.ApiReportMemberTopup);

    app.post("/ApiQuerySettingWeb", controllerMember.ApiQuerySettingWeb);
    app.post(
        "/ApiUpdateSettingWinLoss",
        controllerMember.ApiUpdateSettingWinLoss
    );

    app.post("/ApiQueryMemberOnline", controllerMember.ApiQueryMemberOnline);

    //######################################## Frontend API ########################################

    app.post("/ApiGetBalanceWallet", controllerMember.ApiGetBalanceWallet);
    app.post(
        "/ApiExchangeWalletToGame",
        controllerMember.ApiExchangeWalletToGame
    );
    app.post(
        "/ApiExchangeGameToWallet",
        controllerMember.ApiExchangeGameToWallet
    );
    app.post("/ApiUpdateWheelspinUser", controllerMember.ApiUpdateWheelspinUser);
    app.post("/ApiQuerySettingGame", controllerMember.ApiQuerySettingGame);
    app.post(
        "/ApiQueryPromotionUserByID",
        controllerMember.ApiQueryPromotionUserByID
    );
    app.post("/ApiReceivePromotion", controllerMember.ApiReceivePromotion);
    app.post("/checkWithdraw", controllerMember.checkWithdraw);
    app.post("/ApiUpdateLastLogin", controllerMember.ApiUpdateLastLogin);
    app.post("/ApiCreditLotto", walletControllrt.addCreditLotto);
    app.post("/ApiCheckCreditLotto", walletControllrt.checkCreditLotto);
    app.post("/ApiAddCreditLotto", controllerMember.checkAddCreditLotto);
    app.post("/ApiCheckDay", controllerMember.ApiCheckDay);
    app.post("/ApiReceiveBonus", controllerMember.ApiReceiveBonus);
    app.post("/ApiReceiveBonusWinloss", controllerMember.ApiReceiveBonusWinloss);
    app.post("/ApiLoginLotto", controllerMember.ApiLoginLotto);
    app.post("/ApiPartnerList", controllerMember.getMemberPartnerList);

    //######################################## Frontend API ########################################

    //######################################## Report Lotto ########################################

    app.post(
        "/ApiReportWinLost",
        handleAuthRoute,
        controllerMember.ApiReportWinLost
    );
    app.post(
        "/ApiReportPlayer",
        handleAuthRoute,
        controllerMember.ApiReportPlayer
    );

    app.post(
        "/ApiReportLottoSummary",
        handleAuthRoute,
        controllerMember.ApiReportLottoSummary
    );
    app.post(
        "/ApiReportLottoSummaryCatogy",
        handleAuthRoute,
        controllerMember.ApiReportLottoSummaryCategory
    );
    app.post(
        "/ApiReportLottoSummaryNumber",
        handleAuthRoute,
        controllerMember.ApiReportLottoSummaryNumber
    );
    app.post(
        "/ApiReportLottoSummaryMember",
        handleAuthRoute,
        controllerMember.ApiReportLottoSummaryMember
    );

    app.post(
        "/ApiReportLottoSetting",
        handleAuthRoute,
        controllerMember.ApiReportLottoSetting
    );
    app.post(
        "/ApiUpdateLottoSetting",
        handleAuthRoute,
        controllerMember.ApiUpdateLottoSetting
    );
    app.post(
        "/ApiUpdateLottoSettingYeeKee",
        handleAuthRoute,
        controllerMember.ApiUpdateLottoSettingYeeKee
    );
    app.post(
        "/ApiReportLottoSettingSts",
        handleAuthRoute,
        controllerMember.ApiReportLottoSettingSts
    );
    app.post(
        "/ApiReportLottoSettingManage",
        handleAuthRoute,
        controllerMember.ApiReportLottoSettingManage
    );
    app.post(
        "/ApiReportLottoSettingManageYeeKee",
        handleAuthRoute,
        controllerMember.ApiReportLottoSettingManageYeeKee
    );
    app.post(
        "/ApiReportLottoAlliance",
        handleAuthRoute,
        controllerMember.ApiReportLottoAlliance
    );
    app.post(
        "/ApiReportLottoAllianceSettingBonus",
        handleAuthRoute,
        controllerMember.ApiReportLottoAllianceSettingBonus
    );

    app.post(
        "/ApiUpdateLottoAllianceSettingBonus",
        handleAuthRoute,
        controllerMember.ApiUpdateLottoAllianceSettingBonus
    );

    //######################################## End Report Lotto ########################################

    app.post("/testToken", controllerMember.testToken);
    app.post("/ApiDashBoardAll", controllerMember.ApiDashBoardAll);

    //######################################## TRUEWALLET API ########################################
    app.post("/subMitOTPTrueWallet", controllerMember.subMitOTPTrueWallet);
    app.post("/getOTPTruewallet", controllerMember.getOTPTruewallet);
    app.post("/TrueWalletAPI", controllerMember.TrueWalletAPI);
    app.post("/TrueWalletWebhook", controllerMember.TrueWalletWebhook);

    //######################################## TRUEWALLET API ########################################
    app.post("/testSMS", controllerMember.testSMS);

    app.post("/ApiUpdateGameWebStatus", controllerMember.ApiUpdateGameWebStatus);

    app.post("/ApiGetLottoType", controllerMember.ApiGetLottoType);

    app.post("/ApiGetLottoDate", controllerMember.ApiGetLottoDate);
    app.post("/ApiGetDetailLotto", controllerMember.ApiGetDetailLotto);
    app.post("/ApiGetRewardLotto", controllerMember.ApiGetRewardLotto);
    app.post("/ApiCreateLottoLimit", controllerMember.ApiCreateLottoLimit);
    app.post("/ApiUpdateLottoLimit", controllerMember.ApiUpdateLottoLimit);
    app.post("/ApiDeleteLottoLimit", controllerMember.ApiDeleteLottoLimit);

    app.post("/ApiMemberLoginLotto", controllerMember.ApiMemberLoginLotto);

    app.post(
        "/ApiConvertMember",
        handleAuthRoute,
        controllerMember.ApiConvertMember
    );
    app.post(
        "/ApiConvertMemberPartner",
        handleAuthRoute,
        controllerMember.ApiConvertMemberPartner
    );

    // ###################################################################
    app.post("/ApiTestQueryLottoType", controllerMember.ApiTestQueryLottoType);
    // ###################################################################

    // ##### Aff api ######
    app.post("/ApiMemberAff", refController.ApiMemberAff);
    // app.post('/apiGetDataAff', controllerMember.ApiMemberAff);

    // ##### Aff api ######

    app.post("/ApiMenubar", controllerMember.ApiMenubar);
    app.post("/ApiMenubarStaff", controllerMember.ApiMenubarStaff);
    app.post("/ApiQueryEditStaff", controllerMember.ApiQueryEditStaff);

    app.post("/ApiBoardAnnounce", controllerMember.ApiBoardAnnounce);

    app.post(
        "/ApiQueryTransactionWithId",
        controllerMember.ApiQueryTransactionWithId
    );
    app.post(
        "/ApiQueryTransactionLottoWithId",
        controllerMember.ApiQueryTransactionLottoWithId
    );
    app.post(
        "/ApiQueryTransactionGameWithId",
        controllerMember.ApiQueryTransactionGameWithId
    );
    app.post(
        "/ApiGetTransactionMember",
        controllerMember.ApiGetTransactionMember
    );
    app.post("/ApiTopRanking", controllerMember.ApiTopRanking);
    app.post(
        "/ApiaddCreditTransaction",
        controllerMember.ApiaddCreditTransaction
    );

    app.post("/ApiqueryeBank", controllerMember.ApiqueryeBank);
    app.post(
        "/ApiReportMemberTopupSort",
        controllerMember.ApiReportMemberTopupSort
    );

    app.post("/ApiGetLottoTypeByGroup", controllerMember.ApiGetLottoTypeByGroup);
    app.post("/ApiAddLottoNumber", controllerMember.ApiAddLottoNumber);
    app.post("/ApiGetLottoNumberGroup", controllerMember.ApiGetLottoNumberGroup);
    app.post("/ApiGetLottoNumberDetail", controllerMember.ApiGetLottoNumberDetail);

    app.post("/ApiCheckAllDetail", controllerMember.ApiCheckAllDetail);
    app.post("/ApiUpdateSettingGame", controllerMember.ApiUpdateSettingGame);

    // Coupon Zone

    app.post("/ApiQueryCoupon", controllerMember.ApiQueryCoupon);
    app.post("/ApiaddCoupon", controllerMember.ApiaddCoupon);
    app.post("/ApiUpdateStatusCoupon", controllerMember.ApiUpdateStatusCoupon);

    app.post("/ApideleteCoupon", controllerMember.ApideleteCoupon);
    app.post("/ApiCoupon", controllerMember.ApiCoupon);
    app.post("/ApiQueryGroupCoupon", controllerMember.ApiQueryGroupCoupon);
    app.post(
        "/ApiUpdateStatusCouponGroup",
        controllerMember.ApiUpdateStatusCouponGroup
    );
    app.post("/ApiQueryCouponLog", controllerMember.ApiQueryCouponLog);
    app.post("/ApideleteCouponGroup", controllerMember.ApideleteCouponGroup);

    // Coupon Zone
    app.post("/testSCB", controllerMember.testSCB);

    //New controlor Lotto
    app.post("/testFunc", controllerLotto.testFunc);
    app.post("/ApiGetStockListLotto", controllerLotto.ApiGetStockListLotto);
    app.post("/ApiGetBalanceUser", controllerLotto.ApiGetBalanceUser);
    // app.post('/memberLogin', controllerLotto.memberLogin);
    app.post("/ApiCheckRateNumber", controllerLotto.ApiCheckRateNumber);
    app.post("/ApiCheckRateNumberAgain", controllerLotto.ApiCheckRateNumberAgain);
    app.post("/ApiInsertNumber", controllerLotto.ApiInsertNumber);
    app.post("/ApiUpdateLottoSetting", controllerLotto.ApiUpdateLottoSetting);
    app.post("/ApiQueryLottoGroupType", controllerLotto.ApiQueryLottoGroupType);
    app.post("/ApiHistoryAward", controllerLotto.ApiHistoryAward);
    app.post("/ApiHistoryBetOrder", controllerLotto.ApiHistoryBetOrder);
    app.post(
        "/ApiHistoryBetOrderDetail",
        controllerLotto.ApiHistoryBetOrderDetail
    );
    app.post("/ApiQueryLottoLimitMin", controllerLotto.ApiQueryLottoLimitMin);

    app.post("/ApiGetLottoNumberGroup", controllerLotto.ApiGetLottoNumberGroup);
    app.post("/ApiGetLottoNumberDetail", controllerLotto.ApiGetLottoNumberDetail);
    app.post(
        "/ApiQueryLottoGroupTypeWait",
        controllerLotto.ApiQueryLottoGroupTypeWait
    );

    app.get("/ApiExchangePromotion/:user/:amount", controllerMember.ApiExchangePromotion);
};