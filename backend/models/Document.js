const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },

  filename: {
    type: String,
    required: true
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    default: "Uploaded"
  },

  fileSize: {
    type: Number,
    default: 0
  },

  analysis: {
    type: Object,
    default: null
  },

  // Firebase user's unique ID
  userId: {
    type: String,
    required: true
  }
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;