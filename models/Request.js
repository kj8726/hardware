import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    quantity: { type: String, default: "1" },
    size: { type: String, default: "" },
    brand: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "Fasteners",
        "Hydraulic",
        "Bearings",
        "Tools",
        "Pipes & Fittings",
        "Electrical",
        "Mechanical",
        "Other",
      ],
      default: "Other",
    },
    location: { type: String, required: true },
    city: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "responded", "closed"],
      default: "open",
    },
    responseCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
