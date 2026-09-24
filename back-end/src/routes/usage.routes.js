// SECTION IMPORTS
const express = require('express');
const router = express.Router();

const { 
    getUsage, 
    createUsage, 
    updateUsage, 
    deleteUsage 
} = require('../controllers/usage-controller/usage.controller');

const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

// All usage endpoints require login
router.use(requireAuth);

router.get('/usage', getUsage);
router.post('/usage', createUsage);
router.patch('/usage/:id', updateUsage);

// Rule: only admin can delete usage
router.delete('/usage/:id', requireRole('admin'), deleteUsage);

module.exports = router;
