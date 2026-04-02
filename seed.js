/**
 * HardwareHub – Database Seed Script
 * ------------------------------------
 * Seeds: Users, Shops, Products, Part Requests, Quotes
 *
 * Usage:
 *   node seed.js                  – seed everything
 *   node seed.js --clear          – clear all collections first, then seed
 *   node seed.js --clear-only     – only clear, don't seed
 *
 * Prerequisites:
 *   npm install mongoose bcryptjs dotenv
 *
 * Requires MONGODB_URI in .env.local
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const args       = process.argv.slice(2);
const CLEAR_ONLY  = args.includes("--clear-only");
const CLEAR_FIRST = args.includes("--clear") || CLEAR_ONLY;

/* ─────────────────────────────────────────
   Schemas
───────────────────────────────────────── */

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["customer", "shop_owner", "admin"], default: "customer" },
    image: String,
    emailVerified: Date,
  },
  { timestamps: true }
);

const ShopSchema = new mongoose.Schema(
  {
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:         String,
    description:  String,
    location:     String,
    city:         String,
    phone:        String,
    whatsapp:     String,
    email:        String,
    logo:         String,
    categories:   [String],
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isApproved:   { type: Boolean, default: true },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    shop:         { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    name:         String,
    description:  String,
    category:     String,
    price:        Number,
    unit:         String,
    stock:        Number,
    images:       [String],
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PartRequestSchema = new mongoose.Schema(
  {
    customer:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title:       String,
    description: String,
    category:    String,
    images:      [String],
    location:    String,
    budget:      Number,
    status:      { type: String, enum: ["open", "quoted", "closed"], default: "open" },
    quotesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuoteSchema = new mongoose.Schema(
  {
    request:      { type: mongoose.Schema.Types.ObjectId, ref: "PartRequest" },
    shop:         { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    shopOwner:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price:        Number,
    description:  String,
    availability: String,
    status:       { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const User        = mongoose.models.User        || mongoose.model("User",        UserSchema);
const Shop        = mongoose.models.Shop        || mongoose.model("Shop",        ShopSchema);
const Product     = mongoose.models.Product     || mongoose.model("Product",     ProductSchema);
const PartRequest = mongoose.models.PartRequest || mongoose.model("PartRequest", PartRequestSchema);
const Quote       = mongoose.models.Quote       || mongoose.model("Quote",       QuoteSchema);

/* ─────────────────────────────────────────
   Fake data
───────────────────────────────────────── */

const CITIES = ["Mumbai", "Delhi", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Ahmedabad", "Kolkata"];

const SHOPS = [
  { name: "Sharma Hardware & Tools",     description: "Your one-stop shop for all industrial hardware needs. Over 20 years serving the local community.", categories: ["Fasteners", "Tools", "Mechanical"] },
  { name: "Patel Electrical Supplies",   description: "Specialising in electrical components and wiring accessories for residential and commercial projects.", categories: ["Electrical"] },
  { name: "Mumbai Metal Works",          description: "Premium metal parts and raw materials at competitive prices. Bulk orders welcome.", categories: ["Fasteners", "Mechanical"] },
  { name: "Reliable Parts Co.",          description: "Trusted supplier of genuine OEM and aftermarket parts. Same-day delivery available.", categories: ["Bearings", "Hydraulic", "Mechanical"] },
  { name: "FastFix Hardware",            description: "Quick turnaround on all hardware repairs and part sourcing. We stock what others don't.", categories: ["Fasteners", "Tools"] },
  { name: "Kumar Industrial Store",      description: "Industrial-grade tools and equipment for professionals. Rental options available.", categories: ["Tools", "Mechanical"] },
  { name: "Singh Plumbing Supplies",     description: "Complete plumbing solutions — pipes, fittings, pumps, and valves under one roof.", categories: ["Pipes & Fittings"] },
  { name: "TechParts Hub",              description: "Modern components and expert advice for technical applications.", categories: ["Electrical", "Bearings", "Hydraulic"] },
];

// Products per category — (name, unit, priceRange, description)
const PRODUCTS_BY_CATEGORY = {
  Fasteners: [
    { name: "M12 Hex Bolt SS Grade 8.8 (per piece)",      unit: "piece", price: 28,   stock: 500, description: "Stainless steel M12 × 40mm hex bolt. Grade 8.8. Corrosion-resistant, suitable for outdoor and industrial applications." },
    { name: "M8 Stainless Nut (pack of 50)",               unit: "pack",  price: 180,  stock: 120, description: "M8 stainless steel hex nuts. Pack of 50. Compatible with M8 bolts." },
    { name: "Self-Tapping Screw Set 400 pcs",              unit: "set",   price: 320,  stock: 80,  description: "Assorted self-tapping screws in a plastic organiser box. 400 pieces across multiple sizes." },
    { name: "Anchor Bolt M10 × 100mm",                    unit: "piece", price: 45,   stock: 300, description: "Wedge anchor bolt for concrete fixing. M10 × 100mm with nut and washer included." },
    { name: "Nylon Lock Nut M16 (pack of 25)",             unit: "pack",  price: 210,  stock: 150, description: "M16 nylon insert lock nuts. Vibration-resistant. Pack of 25 pieces." },
  ],
  Hydraulic: [
    { name: "Hydraulic Cylinder Seal Kit 50mm Bore",       unit: "kit",   price: 1250, stock: 30,  description: "Complete seal kit for 50mm bore hydraulic cylinders. Includes all O-rings, seals, and wipers." },
    { name: "Hydraulic Hose 3/8 inch × 1 metre",          unit: "meter", price: 420,  stock: 60,  description: "High-pressure hydraulic hose. 3/8 inch bore. Rated to 280 bar. Stainless steel end fittings." },
    { name: "Hydraulic Quick Coupler Set",                 unit: "set",   price: 890,  stock: 45,  description: "BSP 1/2 inch hydraulic quick release coupler. Includes male and female halves. Carbon steel." },
    { name: "Hydraulic Oil 68 — 5 Litre Can",             unit: "can",   price: 750,  stock: 90,  description: "ISO 68 grade hydraulic oil. 5-litre can. Suitable for most industrial hydraulic systems." },
  ],
  Bearings: [
    { name: "SKF 6203-2RS Deep Groove Ball Bearing",       unit: "piece", price: 185,  stock: 200, description: "SKF 6203-2RS sealed deep groove ball bearing. 17mm ID, 40mm OD. Standard stock item." },
    { name: "FAG 6305 Open Bearing",                      unit: "piece", price: 220,  stock: 160, description: "FAG 6305 open-type ball bearing. 25mm ID, 62mm OD. High load capacity." },
    { name: "Taper Roller Bearing 30205",                  unit: "piece", price: 680,  stock: 75,  description: "30205 taper roller bearing. Suitable for axial and radial loads. 25mm ID, 52mm OD." },
    { name: "Needle Roller Bearing HK2020",               unit: "piece", price: 310,  stock: 100, description: "HK2020 drawn cup needle roller bearing. 20mm ID, 26mm OD. Compact design for tight spaces." },
  ],
  Tools: [
    { name: "Bosch GSB 550 Drill Chuck (Genuine)",        unit: "piece", price: 890,  stock: 25,  description: "Genuine Bosch replacement chuck for GSB 550 drill. 13mm capacity. 1/2-20 UNF thread." },
    { name: "Combination Spanner Set 8–22mm (8 pcs)",     unit: "set",   price: 1450, stock: 40,  description: "Chrome-vanadium steel combination spanner set. 8 spanners from 8mm to 22mm. Mirror polished." },
    { name: "Digital Vernier Caliper 150mm",              unit: "piece", price: 680,  stock: 55,  description: "Stainless steel digital vernier caliper. 0–150mm range. Resolution 0.01mm. IP54 splash-proof." },
    { name: "Torque Wrench 1/2 inch Drive 20–110 Nm",     unit: "piece", price: 2200, stock: 20,  description: "Click-type torque wrench. 1/2 inch drive. Range 20–110 Nm. ±4% accuracy." },
    { name: "Angle Grinder 4.5 inch 850W",               unit: "piece", price: 3200, stock: 15,  description: "850W angle grinder with 115mm disc. Variable speed. Includes side handle and disc guard." },
  ],
  "Pipes & Fittings": [
    { name: "2-inch Brass Gate Valve ISI",                unit: "piece", price: 480,  stock: 60,  description: "ISI marked 2-inch brass gate valve for water supply. Full bore. PN16 rated." },
    { name: "UPVC Elbow 90° 25mm (pack of 10)",           unit: "pack",  price: 120,  stock: 200, description: "25mm UPVC 90-degree elbow. Solvent-cement type. Pack of 10. For water and drainage systems." },
    { name: "GI Pipe 1 inch Class B (per metre)",         unit: "meter", price: 190,  stock: 500, description: "Galvanised iron pipe, 1 inch nominal bore, Class B (medium). Cut to length available." },
    { name: "PPR Pipe 25mm PN20 (4 metre length)",        unit: "piece", price: 360,  stock: 150, description: "PN20 PPR hot and cold water pipe. 25mm OD, 4m length. Suitable for hot water up to 70°C." },
  ],
  Electrical: [
    { name: "Schneider 32A Single Pole MCB C-Curve",      unit: "piece", price: 420,  stock: 80,  description: "Schneider iC60N 32A single-pole MCB. C-curve. 6kA breaking capacity. DIN rail mount." },
    { name: "Legrand 16A 5-pin Industrial Socket",        unit: "piece", price: 780,  stock: 50,  description: "Legrand P17 Tempra Pro 16A 3P+N+E industrial socket. IP44 rated. 380-415V." },
    { name: "1.5 sq mm Copper Wire 90m Roll",             unit: "roll",  price: 1650, stock: 40,  description: "1.5 sq mm FR PVC insulated copper wire. 90m roll. 660/1000V rated. Red colour." },
    { name: "Double Pole RCCB 25A 30mA",                  unit: "piece", price: 1100, stock: 35,  description: "25A double pole RCCB. 30mA sensitivity. Type A. For shock protection in residential panels." },
  ],
  Mechanical: [
    { name: "Single Phase 1HP Induction Motor",           unit: "piece", price: 4800, stock: 12,  description: "1HP 220V single-phase induction motor. 1440 RPM. Foot mounting. B3 flange. IP55 protection." },
    { name: "V-Belt A-Section A40",                       unit: "piece", price: 95,   stock: 200, description: "Classical A-section V-belt. A40 size (1016mm effective length). Oil and heat resistant." },
    { name: "Flexible Shaft Coupling 20mm",               unit: "piece", price: 450,  stock: 60,  description: "Jaw-type flexible coupling. 20mm bore. Spider insert included. Max 6000 RPM." },
    { name: "Steel Sprocket 20T 1 inch Bore",             unit: "piece", price: 380,  stock: 45,  description: "20-tooth steel sprocket for #40/41 roller chain. 1-inch bore. Hardened teeth." },
  ],
};

const PART_REQUESTS = [
  { title: "Looking for 2-inch brass gate valve", description: "Need 2-inch brass gate valve for water supply line. ISI marked preferred. Need 3 pieces.", category: "Pipes & Fittings", budget: 1500 },
  { title: "MCB 32A single pole — urgent",         description: "Tripped and broke. Need a Legrand or Schneider 32A single-pole MCB urgently.", category: "Electrical",       budget: 800  },
  { title: "M12 hex bolts — 50 pcs",              description: "50 pieces of M12 × 40mm stainless steel hex bolts with matching nuts. Grade 8.8.", category: "Fasteners",       budget: 2000 },
  { title: "Bosch drill chuck replacement",        description: "Drill chuck for Bosch GSB 550 stripped out. Looking for genuine replacement.", category: "Tools",            budget: 1200 },
  { title: "Hydraulic cylinder seal kit 50mm",     description: "Seal kit for 50mm bore hydraulic cylinder used in an industrial press.", category: "Hydraulic",       budget: 3500 },
  { title: "6203 ball bearings × 10 pieces",       description: "Standard 6203-2RS bearings. Need 10 pieces. SKF or FAG preferred.", category: "Bearings",        budget: 2500 },
  { title: "Single phase 1HP motor",               description: "Replacement 1HP 220V single-phase induction motor for a water pump.", category: "Mechanical",     budget: 5000 },
  { title: "PPR pipe 25mm 10 metres",              description: "Need 10 metres of 25mm PN20 PPR pipe for hot water plumbing.", category: "Pipes & Fittings", budget: 1200 },
];

const QUOTE_NOTES = [
  "In stock and ready to dispatch within 24 hours.",
  "Available from our warehouse. Price includes GST. Can deliver tomorrow.",
  "Sourced from a trusted supplier. Comes with 6-month replacement warranty.",
  "In stock. We can provide installation support if required.",
  "Genuine brand item. Five or more units available for immediate dispatch.",
];

const AVAILABILITIES = ["In stock", "Next day delivery", "2–3 days", "Available on order (1 week)"];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const pick     = (arr)     => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, n)  => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const avatar   = (seed)    => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
const shopLogo = (seed)    => `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

/* ─────────────────────────────────────────
   Seed functions
───────────────────────────────────────── */

async function clearCollections() {
  console.log("🗑  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Product.deleteMany({}),
    PartRequest.deleteMany({}),
    Quote.deleteMany({}),
  ]);
  console.log("✅ All collections cleared.\n");
}

async function seedUsers() {
  console.log("👤 Seeding users...");
  const password = await bcrypt.hash("Password123!", 10);

  const users = [
    { name: "Admin User",    email: "admin@hardwarehub.com", password, role: "admin",      image: avatar("admin"),   emailVerified: new Date() },
    { name: "Rahul Mehta",   email: "customer1@example.com", password, role: "customer",   image: avatar("rahul"),   emailVerified: new Date() },
    { name: "Priya Sharma",  email: "customer2@example.com", password, role: "customer",   image: avatar("priya"),   emailVerified: new Date() },
    { name: "Aakash Patel",  email: "customer3@example.com", password, role: "customer",   image: avatar("aakash"),  emailVerified: new Date() },
    { name: "Sunita Verma",  email: "customer4@example.com", password, role: "customer",   image: avatar("sunita"),  emailVerified: new Date() },
    ...SHOPS.map((s, i) => ({ name: `Owner — ${s.name}`, email: `shop${i + 1}@example.com`, password, role: "shop_owner", image: avatar(s.name), emailVerified: new Date() })),
  ];

  const created = await User.insertMany(users);
  console.log(`   ✔ ${created.length} users`);
  return created;
}

async function seedShops(owners) {
  console.log("🏪 Seeding shops...");

  const shops = SHOPS.map((s, i) => ({
    owner:       owners[i]._id,
    name:        s.name,
    description: s.description,
    location:    `${rand(1, 200)}, ${pick(["MG Road", "Station Road", "Industrial Area", "Market Street", "Main Bazaar"])}`,
    city:        CITIES[i % CITIES.length],
    phone:       `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`,
    whatsapp:    `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`,
    email:       `shop${i + 1}@example.com`,
    logo:        shopLogo(s.name),
    categories:  s.categories,
    rating:      parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: rand(5, 120),
    isApproved:  true,
    isActive:    true,
  }));

  const created = await Shop.insertMany(shops);
  console.log(`   ✔ ${created.length} shops`);
  return created;
}

async function seedProducts(shops) {
  console.log("📦 Seeding products...");

  const products = [];

  for (const shop of shops) {
    // Each shop seeds products from its own categories
    for (const category of shop.categories) {
      const items = PRODUCTS_BY_CATEGORY[category] || [];
      for (const item of items) {
        products.push({
          shop:        shop._id,
          name:        item.name,
          description: item.description,
          category,
          price:       item.price,
          unit:        item.unit,
          stock:       item.stock,
          images:      [],   // real uploads come from Cloudinary
          rating:      parseFloat((3 + Math.random() * 2).toFixed(1)),
          totalReviews: rand(0, 40),
          isActive:    true,
        });
      }
    }
  }

  const created = await Product.insertMany(products);
  console.log(`   ✔ ${created.length} products`);
  return created;
}

async function seedPartRequests(customers) {
  console.log("📋 Seeding part requests...");

  const requests = PART_REQUESTS.map((r, i) => ({
    ...r,
    customer:    customers[i % customers.length]._id,
    images:      [],
    location:    pick(CITIES),
    status:      pick(["open", "open", "open", "quoted", "closed"]),
    quotesCount: 0,
  }));

  const created = await PartRequest.insertMany(requests);
  console.log(`   ✔ ${created.length} part requests`);
  return created;
}

async function seedQuotes(requests, shops) {
  console.log("💬 Seeding quotes...");
  const quotes = [];

  for (const req of requests) {
    if (req.status === "closed") continue;
    const selected = pickMany(shops, rand(1, 3));
    for (const shop of selected) {
      quotes.push({
        request:      req._id,
        shop:         shop._id,
        shopOwner:    shop.owner,
        price:        Math.floor(req.budget * (0.6 + Math.random() * 0.8)),
        description:  pick(QUOTE_NOTES),
        availability: pick(AVAILABILITIES),
        status:       req.status === "quoted" ? pick(["pending", "accepted"]) : "pending",
      });
    }
    await PartRequest.findByIdAndUpdate(req._id, { quotesCount: selected.length });
  }

  const created = await Quote.insertMany(quotes);
  console.log(`   ✔ ${created.length} quotes`);
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("❌ MONGODB_URI not found in .env.local"); process.exit(1); }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected.\n");

  if (CLEAR_FIRST) await clearCollections();
  if (CLEAR_ONLY)  { await mongoose.disconnect(); console.log("Done."); return; }

  const allUsers    = await seedUsers();
  const customers   = allUsers.filter((u) => u.role === "customer");
  const shopOwners  = allUsers.filter((u) => u.role === "shop_owner");

  const shops    = await seedShops(shopOwners);
  await seedProducts(shops);
  const requests = await seedPartRequests(customers);
  await seedQuotes(requests, shops);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("  Test accounts  (password: Password123!)");
  console.log("─────────────────────────────────────────");
  console.log("  Admin       admin@hardwarehub.com");
  console.log("  Customer    customer1@example.com");
  console.log("  Shop Owner  shop1@example.com");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => { console.error("Seed failed:", err); mongoose.disconnect(); process.exit(1); });