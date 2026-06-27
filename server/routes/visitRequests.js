const express = require('express');
const router = express.Router();
const visitCtrl = require('../controllers/visitRequestController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');


router.get('/', authMiddleware, visitCtrl.listVisitRequests);
router.get('/:id', authMiddleware, visitCtrl.getVisitRequest);
router.post('/:id/assign', authMiddleware, requireAdmin, visitCtrl.assignAgent); 
router.post('/:id/accept', authMiddleware, visitCtrl.agentAccept); 
router.patch('/:id', authMiddleware, visitCtrl.agentAccept);
router.post('/:id/confirm', authMiddleware, requireAdmin, visitCtrl.confirmVisitRequest);
router.post('/:id/cancel', authMiddleware, visitCtrl.cancelVisitRequest);
router.post('/:id/notes', authMiddleware, visitCtrl.addFollowUpNote);
router.patch('/:id/status', authMiddleware, visitCtrl.updateVisitStatus);
router.patch('/:id/property-status', authMiddleware, visitCtrl.agentUpdatePropertyStatus);
router.post('/', visitCtrl.createVisitRequest);

module.exports = router;
