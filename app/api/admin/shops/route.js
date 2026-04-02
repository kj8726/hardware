import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Shop from "@/models/Shop";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url);
  const approved = searchParams.get("approved");

  const filter = {};
  if (approved === "false") filter.isApproved = false;
  else if (approved === "true") filter.isApproved = true;

  const shops = await Shop.find(filter)
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  return NextResponse.json(shops);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { shopId, isApproved } = await request.json();
  await connectDB();
  const shop = await Shop.findByIdAndUpdate(
    shopId, { isApproved }, { new: true }
  ).populate("owner", "name email");

  return NextResponse.json(shop);
}
