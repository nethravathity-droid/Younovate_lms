'use strict';
const mongoose = require('mongoose');

const lmsFeedbackSchema = new mongoose.Schema({
  sessionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  trainerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  rating:        { type: Number, min: 1, max: 5, required: true },
  trainerRating: { type: Number, min: 0, max: 5, default: 0 },
  contentRating: { type: Number, min: 0, max: 5, default: 0 },
  audioRating:   { type: Number, min: 0, max: 5, default: 0 },
  videoRating:   { type: Number, min: 0, max: 5, default: 0 },
  comment:       { type: String, default: '' },
  suggestions:   { type: String, default: '' },
}, { timestamps: true });

lmsFeedbackSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.models.LmsFeedback || mongoose.model('LmsFeedback', lmsFeedbackSchema);
