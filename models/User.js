import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false, minlength: 6 },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "shop_owner", "admin"],
      default: "customer",
    },
    provider: { type: String, default: "credentials" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
