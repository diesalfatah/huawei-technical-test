const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const {
    getSnapshots,
    updateSnapshotSchedule,
    resetSnapshotSchedule,
    runSnapshot,
    cleanupSnapshotFiles,
    downloadSnapshot,
} = require('../controllers/snapshot-controller/snapshot.controller');

router.use(requireAuth);

router.get('/snapshots', getSnapshots);
router.put('/snapshots/schedule', updateSnapshotSchedule);
router.post('/snapshots/schedule/reset', resetSnapshotSchedule);
router.post('/snapshots/run', runSnapshot);
router.post('/snapshots/cleanup', cleanupSnapshotFiles);
router.get('/snapshots/:fileName', downloadSnapshot);

module.exports = router;
