// lib/models/Ornament.js
import mongoose from 'mongoose';

const OrnamentSchema = new mongoose.Schema({
  itemCode: { type: String, unique: true, required: true },
  ornamentName: { type: String, required: true },
  karigarName: { type: String, required: true },
  grossWeight: { type: Number, required: true },
  stoneWeight: { type: Number, default: 0 },
  colorWeight: { type: Number, default: 0 },
  lessWeight: { type: Number, default: 0 },
  netWeight: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OrnamentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Ornament || mongoose.model('Ornament', OrnamentSchema);
