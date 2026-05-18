import mongoose from "mongoose";

const alureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  style: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  imageLabel: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
  },
  colors: {
    type: String,
    required: false,
  },
  finishes: {
    type: String,
    required: false,
  },
  distribution: {
    type: String,
    required: false,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alure", alureSchema);
