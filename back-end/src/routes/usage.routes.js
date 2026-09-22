// SECTION IMPORTS
const express = require('express');
const router = express.Router();

const { getUsage, createUsage, updateUsage, deleteUsage } = require('../controllers/usage-controller/usage.controller');

// USAGE API ROUTES
// PARENT /api
router.get('/usage', getUsage);
router.post('/usage', createUsage);
router.patch('/usage/:id', updateUsage);
router.delete('/usage/:id', deleteUsage);

module.exports = router;
