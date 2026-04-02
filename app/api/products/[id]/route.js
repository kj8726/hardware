import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";

/* ── GET /api/products/[id] ────────────────────────────── */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("shop", "name logo rating city phone whatsapp email isApproved owner");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── PATCH /api/products/[id] ──────────────────────────── */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const product = await Product.findById(params.id).populate("shop", "owner");
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = product.shop?.owner?.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await request.json();
    // Prevent reassigning shop
    delete updates.shop;

    const updated = await Product.findByIdAndUpdate(params.id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── DELETE /api/products/[id] ─────────────────────────── */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const product = await Product.findById(params.id).populate("shop", "owner");
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = product.shop?.owner?.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}