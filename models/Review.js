import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

ReviewSchema.index({ shop: 1, user: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
