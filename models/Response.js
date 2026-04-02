import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    shopOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: String, required: true },
    message: { type: String, required: true },
    deliveryTime: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Response ||
  mongoose.model("Response", ResponseSchema);
