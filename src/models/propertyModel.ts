import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    finishes: [
      {
        type: String,
      },
    ],
    distribution: {
      type: String,
    },
    reviews: [
      {
        id: {
          type: Number,
          required: true,
        },
        author: {
          type: String,
          required: true,
        },
        authorId: {
          type: String,
        },
        rating: {
          type: Number,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: String, // auth0Id del usuario que la creó
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Property", propertySchema);
