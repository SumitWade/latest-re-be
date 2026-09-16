const express = require('express');
const router = express.Router();

const getAllLocalities = require('../controller/locality/get-all-localities');
const addBulkLocalities = require('../controller/locality/add-bulk-locality');
const userAuthentication = require('../middlewares/auth');
const markLocalityActiveInactive = require('../controller/locality/mark-locality-active-inactive');
const deleteLocality = require('../controller/locality/delete-locality-by-id');
const getLocalitiesByCity = require('../controller/locality/drop-down-locality-city-wise');
const getCityDropdown = require('../controller/locality/get-cities-dropdown');
router.post('/add-bulk-localities', userAuthentication, addBulkLocalities);
router.get('/get-all-localities', getAllLocalities);
router.post('/mark-locality-active-inactive', userAuthentication, markLocalityActiveInactive);
router.post("/delete-locality", userAuthentication, deleteLocality);
router.post("/drop-down-locality-city-wise", getLocalitiesByCity);
router.get("/get-drop-down-cities", getCityDropdown);

module.exports = router;