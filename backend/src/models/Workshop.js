'use strict';
const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title:               { type: String, required: true, trim: true },
  description:         { type: String, default: '' },
  subtitle:            { type: String, default: '' },
  category:            { type: String, default: 'Workshop' },
  workshopType:        { type: String, default: 'Workshop' },
  trainerId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerName:         { type: String, default: '' },
  coTrainerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  batchId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  meetingLink:         { type: String, default: '' },
  mode:                { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
  date:                { type: Date, required: true },
  startDate:           { type: Date },
  endDate:             { type: Date },
  time:                { type: String, default: '' },
  duration:            { type: Number, default: 90 },
  feeType:             { type: String, enum: ['Free', 'Paid'], default: 'Free' },
  isFree:              { type: Boolean, default: true },
  fee:                 { type: Number, default: 0 },
  maxSeats:            {
    type: Number,
    default: 100,
    min: [1, 'Maximum seats must be a positive whole number.'],
    validate: {
      validator: function (v) { return Number.isInteger(v) && v > 0; },
      message: 'Maximum seats must be a positive whole number.',
    },
  },
  availableSeats:      {
    type: Number,
    default: 100,
    min: [0, 'Available seats must be a non-negative whole number.'],
    validate: {
      validator: function (v) { return Number.isInteger(v) && v >= 0; },
      message: 'Available seats must be a non-negative whole number.',
    },
  },
  registrationCount:   { type: Number, default: 0 },
  waitingList:         { type: Boolean, default: false },
  certificateEnabled:  { type: Boolean, default: true },
  attendanceRequired:  { type: Boolean, default: true },
  language:            { type: String, default: 'English' },
  banner:              { type: String, default: '' },
  bannerImage:         { type: String, default: '' },
  thumbnail:           { type: String, default: '' },
  // Status & visibility
  status:              { type: String, enum: ['Draft', 'Published', 'Live', 'Completed', 'Archived', 'Cancelled'], default: 'Draft' },
  published:           { type: Boolean, default: false },
  registrationOpen:    { type: Boolean, default: true },
  // Resources
  pdfResources:        { type: String, default: '' },
  slidesLink:          { type: String, default: '' },
  videosLink:          { type: String, default: '' },
  githubLink:          { type: String, default: '' },
  referenceLinks:      { type: String, default: '' },
  learningOutcomes:    { type: String, default: '' },
  prerequisites:       { type: String, default: '' },
  createdBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

workshopSchema.index({ trainerId: 1, status: 1 });
workshopSchema.index({ date: 1 });
workshopSchema.index({ createdBy: 1 });

module.exports = mongoose.models.Workshop || mongoose.model('Workshop', workshopSchema);

