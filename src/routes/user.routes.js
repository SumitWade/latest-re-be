const googleLogin = require('../controller/google-sign-in/login-with-google');
const activeInactiveUser = require('../controller/user-management/active-inactive-user');
const exportUserActions = require('../controller/user-management/export-user-actions');
const generateOtp = require('../controller/user-management/generate-otp');
const getUserActivityDetails = require('../controller/user-management/get-user-activity-details');
const getUserDetailByObjId = require('../controller/user-management/get-user-detail-by-obj-id');
const userLogin = require('../controller/user-management/login-user');
const sendOTPForMobileVerification = require('../controller/user-management/send-otp-for-mobile');
const trustedDeveloper = require('../controller/user-management/trusted-developer');
const userDetailUpdate = require('../controller/user-management/user-detail-update');
const userPaginatedList = require('../controller/user-management/user-paginated-list');
const userRegistration = require('../controller/user-management/user-registration');
const verifyMobile = require('../controller/user-management/verify-mobile');
const userAuthentication = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rate-limiting');
const { getTrustedDeveloperUsers } = require('../services/user.service');

const userRoutes = require('express').Router();

userRoutes.post("/user-registration", userRegistration)
userRoutes.post("/generate-otp", generateOtp)
userRoutes.post("/user-login", loginLimiter, userLogin)

userRoutes.post("/user-paginated-list", userPaginatedList)
userRoutes.post("/get-user-detail-by-obj-id", getUserDetailByObjId)
userRoutes.post("/user-details-update", userAuthentication, userDetailUpdate)
userRoutes.post("/active-inactive-user", activeInactiveUser)

//for mobile verification 
userRoutes.post("/send-otp-for-mobile-verification", sendOTPForMobileVerification)
userRoutes.post("/verify-mobile", verifyMobile)

// user action 
userRoutes.post("/user-activity-details", userAuthentication, getUserActivityDetails)
userRoutes.post("/export-user-actions", userAuthentication, exportUserActions)

userRoutes.post("/google-login", googleLogin)

userRoutes.get("/get-trusted-developer-users", userAuthentication, trustedDeveloper)

module.exports = userRoutes;
