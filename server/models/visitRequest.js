const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  preferredDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in-process', 'finished'], default: 'pending' },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('VisitRequest', visitRequestSchema);
