const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },

    nodes: {
        type: Array,
        default: []
    },
    edges: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);