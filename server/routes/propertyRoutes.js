const express = require('express');
const {
    createProperty,
    listProperties,
    getPropertyById,
    listMyProperties,
    updateProperty,
    deleteProperty,
    addPropertyMedia,
    removePropertyMedia,
} = require('../controllers/propertyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeProperty } = require('../middleware/authorizeProperty');

const router = express.Router();

router.get('/', listProperties);
router.get('/my-properties', authMiddleware, listMyProperties);
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, createProperty);
router.post('/:id/media', authMiddleware, authorizeProperty, addPropertyMedia);
router.delete('/:id/media', authMiddleware, authorizeProperty, removePropertyMedia);
router.put('/:id', authMiddleware, authorizeProperty, updateProperty);
router.delete('/:id', authMiddleware, authorizeProperty, deleteProperty);

module.exports = router;