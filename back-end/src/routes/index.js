const { getUsage } = require('../controllers/usage.controller');

const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
// router.get('/usage', (req, res) => res.json({ status: getUsage() }));

module.exports = router;