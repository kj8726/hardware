import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      createdAt: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
    };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("shop", "name logo rating city isApproved")
      .sort(sortOptions[sortBy] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ products, total, pages: Math.ceil(total / limit), page });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "shop_owner") {
      return NextResponse.json({ error: "Only shop owners can list products" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, images, category, brand, model, stock, unit, tags } = body;

    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ error: "Name, description, price, and category are required" }, { status: 400 });
    }

    await connectDB();
    const shop = await Shop.findOne({ owner: session.user.id, isApproved: true });
    if (!shop) {
      return NextResponse.json({ error: "You need an approved shop to list products" }, { status: 403 });
    }

    const product = await Product.create({
      shop: shop._id,
      seller: session.user.id,
      name,
      description,
      price: Number(price),
      images: images || [],
      category,
      brand: brand || "",
      model: model || "",
      stock: Number(stock) || 0,
      unit: unit || "piece",
      tags: tags || [],
    });

    await product.populate("shop", "name logo rating city");
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
