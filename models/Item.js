const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['dairy', 'produce', 'meat', 'pantry', 'frozen', 'beverages', 'other'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        enum: ['fridge', 'freezer', 'pantry'],
        required: true
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster dashboard and inventory queries
itemSchema.index({ user: 1, expiryDate: 1 });

module.exports = mongoose.model('Item', itemSchema);
