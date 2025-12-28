const express = require('express');
const router = express.Router();
const { getItems, addItem, addBatchItems, updateItem, removeItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { itemValidation } = require('../middleware/validator');

router.use(protect);

router.get('/', getItems);
router.post('/', itemValidation, addItem);
router.post('/batch', addBatchItems);
router.put('/:id', itemValidation, updateItem);
router.delete('/:id', removeItem);

module.exports = router;
