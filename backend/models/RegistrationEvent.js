const mongoose = require('mongoose');

const registrationEventSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    status: { type: String, required: true },
    requiresApproval: { type: Boolean, default: false },
    source: { type: String, default: 'public-register' },
  },
  { timestamps: true }
);

const RegistrationEvent = mongoose.model('RegistrationEvent', registrationEventSchema);

module.exports = RegistrationEvent;
