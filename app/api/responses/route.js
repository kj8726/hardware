import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Response from "@/models/Response";
import Request from "@/models/Request";
import Shop from "@/models/Shop";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "shop_owner") {
      return NextResponse.json({ error: "Only shop owners can respond" }, { status: 403 });
    }

    const { requestId, price, message, deliveryTime, inStock } = await request.json();

    if (!requestId || !price || !message) {
      return NextResponse.json({ error: "Request ID, price, and message are required" }, { status: 400 });
    }

    await connectDB();

    const shop = await Shop.findOne({ owner: session.user.id, isApproved: true });
    if (!shop) {
      return NextResponse.json({ error: "You need an approved shop to respond" }, { status: 403 });
    }

    const existing = await Response.findOne({ request: requestId, shop: shop._id });
    if (existing) {
      return NextResponse.json({ error: "You have already responded to this request" }, { status: 409 });
    }

    const response = await Response.create({
      request: requestId,
      shop: shop._id,
      shopOwner: session.user.id,
      price,
      message,
      deliveryTime: deliveryTime || "",
      inStock: inStock !== false,
    });

    await Request.findByIdAndUpdate(requestId, {
      $inc: { responseCount: 1 },
      status: "responded",
    });

    await response.populate("shop", "name logo rating city phone whatsapp");

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Response error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
