import mongoose from 'mongoose';

const imageSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Number, required: true },
    rotation: { type: Number, default: 0 }, 
    saved: { type: Boolean, default: false }, 
    batchId: { type: String },
    modifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Image = mongoose.model('Image', imageSchema);
export default Image;
