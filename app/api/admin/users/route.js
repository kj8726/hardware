import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

async function adminGuard(session) {
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const guard = await adminGuard(session);
  if (guard) return guard;

  await connectDB();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  const guard = await adminGuard(session);
  if (guard) return guard;

  const { userId, updates } = await request.json();
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  return NextResponse.json(user);
}
