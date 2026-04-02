/**
 * HardwareHub – Database Seed Script
 * ------------------------------------
 * Populates MongoDB with realistic fake data so the site
 * doesn't look empty during development / demos.
 *
 * Usage:
 *   node seed.js                  – seed everything
 *   node seed.js --clear          – clear all collections first, then seed
 *   node seed.js --clear-only     – only clear, don't seed
 *
 * Prerequisites:
 *   npm install mongoose bcryptjs dotenv
 *
 * Make sure your .env.local (or .env) has:
 *   MONGODB_URI=mongodb+srv://...
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* ─────────────────────────────────────────
   0.  CLI flags
───────────────────────────────────────── */
const args = process.argv.slice(2);
const CLEAR_ONLY = args.includes("--clear-only");
const CLEAR_FIRST = args.includes("--clear") || CLEAR_ONLY;

/* ─────────────────────────────────────────
   1.  Schemas  (mirror your real models)
───────────────────────────────────────── */

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,          // hashed
    role: { type: String, enum: ["customer", "shop_owner", "admin"], default: "customer" },
    image: String,
    emailVerified: Date,
  },
  { timestamps: true }
);

const ShopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    description: String,
    address: String,
    city: String,
    phone: String,
    email: String,
    logo: String,
    categories: [String],       // e.g. ["plumbing", "electrical"]
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PartRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    category: String,
    images: [String],
    location: String,
    budget: Number,
    status: { type: String, enum: ["open", "quoted", "closed"], default: "open" },
    quotesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuoteSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "PartRequest" },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    shopOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price: Number,
    description: String,
    availability: String,       // e.g. "In stock", "2-3 days"
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
const PartRequest = mongoose.models.PartRequest || mongoose.model("PartRequest", PartRequestSchema);
const Quote = mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);

/* ─────────────────────────────────────────
   2.  Fake data
───────────────────────────────────────── */

const CATEGORIES = ["plumbing", "electrical", "fasteners", "tools", "hydraulics", "pneumatics", "bearings", "motors"];

const CITIES = ["Mumbai", "Delhi", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Ahmedabad", "Kolkata"];

const SHOP_NAMES = [
  "Sharma Hardware & Tools",
  "Patel Electrical Supplies",
  "Mumbai Metal Works",
  "Reliable Parts Co.",
  "FastFix Hardware",
  "Kumar Industrial Store",
  "Singh Plumbing Supplies",
  "TechParts Hub",
];

const SHOP_DESCRIPTIONS = [
  "Your one-stop shop for all industrial hardware needs. Over 20 years of experience serving the local community.",
  "Specializing in electrical components and wiring accessories for residential and commercial projects.",
  "Premium metal fabrication parts and raw materials at competitive prices. Bulk orders welcome.",
  "Trusted supplier of genuine OEM and aftermarket parts. Same-day delivery available.",
  "Quick turnaround on all hardware repairs and part sourcing. We stock what others don't.",
  "Industrial-grade tools and equipment for professionals. Rental options available.",
  "Complete plumbing solutions — pipes, fittings, pumps, and valves under one roof.",
  "Tech-forward hardware store offering modern components and expert advice.",
];

const PART_REQUESTS = [
  {
    title: "Looking for 2-inch brass gate valve",
    description: "Need a 2-inch brass gate valve for a water supply line. Prefer ISI marked. Need at least 3 pieces.",
    category: "plumbing",
    budget: 1500,
  },
  {
    title: "MCB 32A single pole — urgent",
    description: "Tripped and broke. Need a Legrand or Schneider 32A single-pole MCB as soon as possible.",
    category: "electrical",
    budget: 800,
  },
  {
    title: "M12 hex bolts — 50 pcs",
    description: "Need 50 pieces of M12 × 40mm stainless steel hex bolts with matching nuts. Grade 8.8.",
    category: "fasteners",
    budget: 2000,
  },
  {
    title: "Bosch drill chuck replacement",
    description: "Drill chuck for Bosch GSB 550 stripped out. Looking for genuine replacement part.",
    category: "tools",
    budget: 1200,
  },
  {
    title: "Hydraulic cylinder seal kit — 50mm bore",
    description: "Need a seal kit for a 50mm bore hydraulic cylinder used in an industrial press. Brand flexible.",
    category: "hydraulics",
    budget: 3500,
  },
  {
    title: "6203 deep groove ball bearings × 10",
    description: "Standard 6203-2RS bearings. Need 10 pieces. Please quote with brand (SKF / FAG preferred).",
    category: "bearings",
    budget: 2500,
  },
  {
    title: "Single phase 1HP motor",
    description: "Replacement 1HP 220V single-phase induction motor for a water pump application.",
    category: "motors",
    budget: 5000,
  },
  {
    title: "Pneumatic air hose 10m",
    description: "Looking for a 10-metre PU coiled air hose with 1/4 inch BSP fittings on both ends.",
    category: "pneumatics",
    budget: 900,
  },
];

const QUOTE_DESCRIPTIONS = [
  "We have this item in stock and can arrange delivery within 24 hours.",
  "Available from our warehouse. Price includes GST. Can deliver by tomorrow.",
  "We sourced this from a trusted supplier. Comes with a 6-month replacement warranty.",
  "In stock. We can also provide installation support if required.",
  "Genuine brand item. We have 5+ units available for immediate dispatch.",
];

const AVAILABILITIES = ["In stock", "Next day delivery", "2–3 days", "Available on order (1 week)"];

/* ─────────────────────────────────────────
   3.  Helpers
───────────────────────────────────────── */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Placeholder images from picsum (public, no auth needed)
function avatar(seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
}

function shopLogo(seed) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
}

/* ─────────────────────────────────────────
   4.  Seeding functions
───────────────────────────────────────── */

async function clearCollections() {
  console.log("🗑  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    PartRequest.deleteMany({}),
    Quote.deleteMany({}),
  ]);
  console.log("✅ All collections cleared.\n");
}

async function seedUsers() {
  console.log("👤 Seeding users...");

  const password = await bcrypt.hash("Password123!", 10);

  const users = [
    // Admin
    {
      name: "Admin User",
      email: "admin@hardwarehub.com",
      password,
      role: "admin",
      image: avatar("admin"),
      emailVerified: new Date(),
    },
    // Customers
    ...["Rahul Mehta", "Priya Sharma", "Aakash Patel", "Sunita Verma"].map((name, i) => ({
      name,
      email: `customer${i + 1}@example.com`,
      password,
      role: "customer",
      image: avatar(name),
      emailVerified: new Date(),
    })),
    // Shop owners (one per shop)
    ...SHOP_NAMES.map((shopName, i) => ({
      name: `Owner of ${shopName}`,
      email: `shop${i + 1}@example.com`,
      password,
      role: "shop_owner",
      image: avatar(shopName),
      emailVerified: new Date(),
    })),
  ];

  const created = await User.insertMany(users);
  console.log(`   ✔ ${created.length} users created`);
  return created;
}

async function seedShops(ownerUsers) {
  console.log("🏪 Seeding shops...");

  const shops = SHOP_NAMES.map((name, i) => ({
    owner: ownerUsers[i]._id,
    name,
    description: SHOP_DESCRIPTIONS[i],
    address: `${rand(1, 200)}, ${pick(["MG Road", "Station Road", "Industrial Area", "Market Street", "Main Bazaar"])}`,
    city: CITIES[i % CITIES.length],
    phone: `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`,
    email: `shop${i + 1}@example.com`,
    logo: shopLogo(name),
    categories: pickMany(CATEGORIES, rand(2, 4)),
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: rand(5, 120),
    isVerified: Math.random() > 0.3,
    isActive: true,
  }));

  const created = await Shop.insertMany(shops);
  console.log(`   ✔ ${created.length} shops created`);
  return created;
}

async function seedPartRequests(customerUsers) {
  console.log("📦 Seeding part requests...");

  const requests = PART_REQUESTS.map((r, i) => ({
    ...r,
    customer: customerUsers[i % customerUsers.length]._id,
    images: [],                  // leave empty — real uploads come from Cloudinary
    location: pick(CITIES),
    status: pick(["open", "open", "open", "quoted", "closed"]),
    quotesCount: 0,
  }));

  const created = await PartRequest.insertMany(requests);
  console.log(`   ✔ ${created.length} part requests created`);
  return created;
}

async function seedQuotes(requests, shops) {
  console.log("💬 Seeding quotes...");

  const quotes = [];

  for (const request of requests) {
    if (request.status === "closed") continue;  // skip closed ones

    const numQuotes = rand(1, Math.min(3, shops.length));
    const selectedShops = pickMany(shops, numQuotes);

    for (const shop of selectedShops) {
      quotes.push({
        request: request._id,
        shop: shop._id,
        shopOwner: shop.owner,
        price: Math.floor(request.budget * (0.6 + Math.random() * 0.8)),
        description: pick(QUOTE_DESCRIPTIONS),
        availability: pick(AVAILABILITIES),
        status: request.status === "quoted" ? pick(["pending", "accepted"]) : "pending",
      });
    }

    // Update quotesCount on the request
    await PartRequest.findByIdAndUpdate(request._id, { quotesCount: numQuotes });
  }

  const created = await Quote.insertMany(quotes);
  console.log(`   ✔ ${created.length} quotes created`);
  return created;
}

/* ─────────────────────────────────────────
   5.  Main
───────────────────────────────────────── */

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found. Add it to .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected.\n");

  if (CLEAR_FIRST) await clearCollections();
  if (CLEAR_ONLY) {
    await mongoose.disconnect();
    console.log("Done.");
    return;
  }

  const allUsers = await seedUsers();

  // Separate by role
  const adminUser   = allUsers.filter((u) => u.role === "admin");
  const customers   = allUsers.filter((u) => u.role === "customer");
  const shopOwners  = allUsers.filter((u) => u.role === "shop_owner");

  const shops    = await seedShops(shopOwners);
  const requests = await seedPartRequests(customers);
  await seedQuotes(requests, shops);

  console.log("\n🎉 Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Test accounts (password: Password123!)");
  console.log("─────────────────────────────────────────");
  console.log("  Admin       admin@hardwarehub.com");
  console.log("  Customer    customer1@example.com");
  console.log("  Shop Owner  shop1@example.com");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});