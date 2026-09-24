const express = require('express');
const router = express.Router();

const { 
    getUsage, 
    createUsage, 
    updateUsage, 
    deleteUsage 
} = require('../controllers/usage-controller/usage.controller');

const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/usage', getUsage);

router.post('/usage', requireAuth, createUsage);
router.patch('/usage/:id', requireAuth, updateUsage);

router.delete('/usage/:id', requireAuth, requireRole('admin'), deleteUsage);

module.exports = router;
