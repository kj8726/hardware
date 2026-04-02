import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
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
      required: true,
    },
    brand: { type: String, default: "" },
    model: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: "piece" },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
