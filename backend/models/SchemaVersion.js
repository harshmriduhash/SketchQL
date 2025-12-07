const mongoose = require('mongoose');

const SchemaVersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  schemaJSON: {
    type: Object,
    required: true
  },
  label: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  // Compound index to ensure unique version numbers per project
  // Note: We'll handle version numbering in the service layer
});

// Index for efficient querying
SchemaVersionSchema.index({ projectId: 1, versionNumber: -1 });

module.exports = mongoose.model('SchemaVersion', SchemaVersionSchema);

