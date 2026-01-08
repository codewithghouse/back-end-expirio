const Item = require('../models/Item');
const Batch = require('../models/Batch');
const User = require('../models/User');

// @desc    Get all items for logged in user
// @route   GET /api/items
// @access  Private
exports.getItems = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        // OPTIMIZATION: Use .lean() for performance and .select() for minimal payload
        const items = await Item.find({ user: userId })
            .select('name category quantity unit expiryDate location notes')
            .sort({ expiryDate: 1 })
            .lean();

        res.json(items);
    } catch (error) {
        next(error);
    }
};


// @desc    Add new item
// @route   POST /api/items
// @access  Private
exports.addItem = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;

        // 1. Verify user exists in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found in database'
            });
        }

        const newItem = new Item({
            ...req.body,
            user: userId
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Add batch of items
// @route   POST /api/items/batch
// @access  Private
exports.addBatchItems = async (req, res, next) => {
    try {
        const { items } = req.body;
        const userId = req.user._id || req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items provided' });
        }

        // 1. Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not found'
            });
        }

        // 2. Create a new batch
        const batch = new Batch({
            user: userId,
            itemsCount: items.length
        });
        const savedBatch = await batch.save();

        // 3. Prepare items with userId and batchId
        const itemsToInsert = items.map(item => ({
            ...item,
            user: userId,
            batchId: savedBatch._id
        }));

        const savedItems = await Item.insertMany(itemsToInsert);

        res.status(201).json({
            success: true,
            batchId: savedBatch._id,
            items: savedItems
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        if (item.user.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.json(item);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.removeItem = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        if (item.user.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        next(error);
    }
};
