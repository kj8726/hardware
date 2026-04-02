import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Shop from "@/models/Shop";

/* ── GET /api/products ─────────────────────────────────── */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page     = parseInt(searchParams.get("page")   || "1");
    const limit    = parseInt(searchParams.get("limit")  || "12");
    const sortBy   = searchParams.get("sortBy")          || "createdAt";
    const category = searchParams.get("category");
    const search   = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand:       { $regex: search, $options: "i" } },
        { tags:        { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sort = {};
    if      (sortBy === "price_asc")  sort = { price:  1 };
    else if (sortBy === "price_desc") sort = { price: -1 };
    else if (sortBy === "rating")     sort = { rating: -1, totalReviews: -1 };
    else                              sort = { createdAt: -1 };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const products = await Product.find(filter)
      .populate("shop", "name city isApproved owner")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Only show products from approved shops
    const filtered = products.filter((p) => p.shop?.isApproved !== false);

    return NextResponse.json({ products: filtered, total, pages, page });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── POST /api/products ────────────────────────────────── */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "shop_owner") {
      return NextResponse.json({ error: "Only shop owners can list products" }, { status: 403 });
    }

    await connectDB();

    // Find the shop that belongs to this owner
    const shop = await Shop.findOne({ owner: session.user.id });
    if (!shop) {
      return NextResponse.json({ error: "You need to register a shop first" }, { status: 400 });
    }
    if (!shop.isApproved) {
      return NextResponse.json({ error: "Your shop is pending approval. You cannot list products yet." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, brand, model, tags, price, unit, stock, images } = body;

    if (!name || !category || !price) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const product = await Product.create({
      shop:        shop._id,
      name:        name.trim(),
      description: description || "",
      category,
      brand:       brand  || "",
      model:       model  || "",
      tags:        Array.isArray(tags) ? tags : [],
      price:       parseFloat(price),
      unit:        unit  || "piece",
      stock:       parseInt(stock) || 0,
      images:      Array.isArray(images) ? images : [],
      isActive:    true,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}