const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  preferredDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  message: { type: String, default: '' },
  requestKey: { type: String, required: false, trim: true },
  followUpNotes: [{
    note: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['pending', 'in-process', 'finished', 'cancelled'], default: 'pending' },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

visitRequestSchema.index({ requestKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('VisitRequest', visitRequestSchema);
