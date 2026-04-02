import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Shop from "@/models/Shop";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");
    if (!shopId) return NextResponse.json({ error: "shopId required" }, { status: 400 });

    await connectDB();
    const reviews = await Review.find({ shop: shopId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { shopId, rating, comment } = await request.json();
    if (!shopId || !rating || !comment) {
      return NextResponse.json({ error: "Shop ID, rating and comment required" }, { status: 400 });
    }

    await connectDB();

    const review = await Review.create({
      shop: shopId, user: session.user.id, rating, comment,
    });

    const allReviews = await Review.find({ shop: shopId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Shop.findByIdAndUpdate(shopId, {
      rating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length,
    });

    await review.populate("user", "name avatar");
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this shop" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
