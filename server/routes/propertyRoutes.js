const express = require('express');
const {
    createProperty,
    listProperties,
    listMyProperties,
    updateProperty,
    deleteProperty,
} = require('../controllers/propertyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authorizeProperty } = require('../middleware/authorizeProperty');

const router = express.Router();

router.get('/', listProperties);
router.get('/my-properties', authMiddleware, listMyProperties);
router.post('/', authMiddleware, createProperty);
router.put('/:id', authMiddleware, authorizeProperty, updateProperty);
router.delete('/:id', authMiddleware, authorizeProperty, deleteProperty);

module.exports = router;