import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Shop from "@/models/Shop";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const approved = searchParams.get("approved");

    const filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (category) filter.categories = category;
    if (approved !== null) filter.isApproved = approved !== "false";
    else filter.isApproved = true;

    const shops = await Shop.find(filter)
      .populate("owner", "name email avatar")
      .sort({ rating: -1, totalReviews: -1 })
      .lean();

    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "shop_owner") {
      return NextResponse.json({ error: "Only shop owners can register shops" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, logo, location, city, phone, whatsapp, email, categories } = body;

    if (!name || !location || !city) {
      return NextResponse.json({ error: "Shop name, location, and city are required" }, { status: 400 });
    }

    await connectDB();

    const existing = await Shop.findOne({ owner: session.user.id });
    if (existing) {
      return NextResponse.json({ error: "You already have a registered shop" }, { status: 409 });
    }

    const shop = await Shop.create({
      owner: session.user.id,
      name, description: description || "",
      logo: logo || "",
      location, city,
      phone: phone || "", whatsapp: whatsapp || "", email: email || "",
      categories: categories || [],
      isApproved: false,
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
