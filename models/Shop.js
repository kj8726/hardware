import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    location: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    categories: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
