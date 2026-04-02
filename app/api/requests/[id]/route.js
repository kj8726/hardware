import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import Response from "@/models/Response";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const req = await Request.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("user", "name avatar location");

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const responses = await Response.find({ request: params.id })
      .populate("shop", "name logo rating city phone whatsapp")
      .sort({ createdAt: -1 });

    return NextResponse.json({ request: req, responses });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const req = await Request.findById(params.id);
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (req.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Request.findByIdAndDelete(params.id);
    await Response.deleteMany({ request: params.id });

    return NextResponse.json({ message: "Request deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
