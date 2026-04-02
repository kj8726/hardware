import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const status = searchParams.get("status") || "open";

    const filter = { status };
    if (category && category !== "all") filter.category = category;
    if (city) filter.city = { $regex: city, $options: "i" };

    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      requests,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, imagePublicId, quantity, size, brand, category, location, city } = body;

    if (!title || !description || !location || !city) {
      return NextResponse.json(
        { error: "Title, description, location, and city are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const newRequest = await Request.create({
      user: session.user.id,
      title,
      description,
      image: image || "",
      imagePublicId: imagePublicId || "",
      quantity: quantity || "1",
      size: size || "",
      brand: brand || "",
      category: category || "Other",
      location,
      city,
    });

    await newRequest.populate("user", "name avatar");

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
