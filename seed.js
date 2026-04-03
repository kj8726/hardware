/**
 * HardwareHub – Database Seed Script
 * ------------------------------------
 * Seeds: Users, Shops, Products, Part Requests, Quotes
 * Images are fetched from picsum.photos and uploaded to Cloudinary
 *
 * Usage:
 *   node seed.js                  – seed everything
 *   node seed.js --clear          – clear all collections first, then seed
 *   node seed.js --clear-only     – only clear, don't seed
 *
 * Requires in .env.local:
 *   MONGODB_URI
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

require("dotenv").config({ path: ".env.local" });
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const { v2: cloudinary } = require("cloudinary");

// ── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const args        = process.argv.slice(2);
const CLEAR_ONLY  = args.includes("--clear-only");
const CLEAR_FIRST = args.includes("--clear") || CLEAR_ONLY;

// ── Schemas ────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    name:         String,
    email:        { type: String, unique: true },
    password:     String,
    role:         { type: String, enum: ["customer", "shop_owner", "admin"], default: "customer" },
    avatar:       String,
    provider:     { type: String, default: "credentials" },
    location:     { type: String, default: "" },
    phone:        { type: String, default: "" },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ShopSchema = new mongoose.Schema(
  {
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:         String,
    description:  String,
    logo:         { type: String, default: "" },
    location:     String,
    city:         String,
    phone:        String,
    whatsapp:     String,
    email:        String,
    categories:   [String],
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isApproved:   { type: Boolean, default: true },
    isActive:     { type: Boolean, default: true },
    totalSales:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    shop:         { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    name:         String,
    description:  String,
    category:     String,
    brand:        { type: String, default: "" },
    model:        { type: String, default: "" },
    tags:         [String],
    price:        Number,
    unit:         String,
    stock:        Number,
    images:       [String],
    views:        { type: Number, default: 0 },
    rating:       { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const RequestSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title:         String,
    description:   String,
    image:         { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    quantity:      { type: String, default: "1" },
    size:          { type: String, default: "" },
    brand:         { type: String, default: "" },
    category:      { type: String, default: "Other" },
    location:      String,
    city:          String,
    status:        { type: String, enum: ["open", "responded", "closed"], default: "open" },
    responseCount: { type: Number, default: 0 },
    views:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ResponseSchema = new mongoose.Schema(
  {
    request:      { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
    shop:         { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    shopOwner:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    price:        String,
    message:      String,
    deliveryTime: { type: String, default: "" },
    inStock:      { type: Boolean, default: true },
    isAccepted:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User     = mongoose.models.User     || mongoose.model("User",     UserSchema);
const Shop     = mongoose.models.Shop     || mongoose.model("Shop",     ShopSchema);
const Product  = mongoose.models.Product  || mongoose.model("Product",  ProductSchema);
const Request  = mongoose.models.Request  || mongoose.model("Request",  RequestSchema);
const Response = mongoose.models.Response || mongoose.model("Response", ResponseSchema);

// ── Static data ────────────────────────────────────────────────────────────

const CITIES = ["Mumbai", "Delhi", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Ahmedabad", "Kolkata"];

const SHOPS = [
  { name: "Sharma Hardware & Tools",   description: "Your one-stop shop for all industrial hardware needs. Over 20 years serving the local community.",          categories: ["Fasteners", "Tools", "Mechanical"] },
  { name: "Patel Electrical Supplies", description: "Specialising in electrical components and wiring accessories for residential and commercial projects.",      categories: ["Electrical"] },
  { name: "Mumbai Metal Works",        description: "Premium metal parts and raw materials at competitive prices. Bulk orders welcome.",                          categories: ["Fasteners", "Mechanical"] },
  { name: "Reliable Parts Co.",        description: "Trusted supplier of genuine OEM and aftermarket parts. Same-day delivery available.",                        categories: ["Bearings", "Hydraulic", "Mechanical"] },
  { name: "FastFix Hardware",          description: "Quick turnaround on all hardware repairs and part sourcing. We stock what others don't.",                    categories: ["Fasteners", "Tools"] },
  { name: "Kumar Industrial Store",    description: "Industrial-grade tools and equipment for professionals. Rental options available.",                          categories: ["Tools", "Mechanical"] },
  { name: "Singh Plumbing Supplies",   description: "Complete plumbing solutions — pipes, fittings, pumps, and valves under one roof.",                          categories: ["Pipes & Fittings"] },
  { name: "TechParts Hub",             description: "Modern components and expert advice for technical applications.",                                            categories: ["Electrical", "Bearings", "Hydraulic"] },
];

const PRODUCTS_BY_CATEGORY = {
  Fasteners: [
    { name: "M12 Hex Bolt SS Grade 8.8 (per piece)",  unit: "piece", price: 28,   stock: 500, description: "Stainless steel M12 × 40mm hex bolt. Grade 8.8. Corrosion-resistant, suitable for outdoor and industrial applications.",  tags: ["bolt", "m12", "stainless"] },
    { name: "M8 Stainless Nut (pack of 50)",           unit: "pack",  price: 180,  stock: 120, description: "M8 stainless steel hex nuts. Pack of 50. Compatible with M8 bolts.",                                                       tags: ["nut", "m8", "stainless"] },
    { name: "Self-Tapping Screw Set 400 pcs",          unit: "set",   price: 320,  stock: 80,  description: "Assorted self-tapping screws in a plastic organiser box. 400 pieces across multiple sizes.",                               tags: ["screw", "self-tapping", "set"] },
    { name: "Anchor Bolt M10 × 100mm",                unit: "piece", price: 45,   stock: 300, description: "Wedge anchor bolt for concrete fixing. M10 × 100mm with nut and washer included.",                                        tags: ["anchor", "bolt", "m10"] },
    { name: "Nylon Lock Nut M16 (pack of 25)",         unit: "pack",  price: 210,  stock: 150, description: "M16 nylon insert lock nuts. Vibration-resistant. Pack of 25 pieces.",                                                     tags: ["nut", "locknut", "m16"] },
  ],
  Hydraulic: [
    { name: "Hydraulic Cylinder Seal Kit 50mm Bore",   unit: "kit",   price: 1250, stock: 30,  description: "Complete seal kit for 50mm bore hydraulic cylinders. Includes all O-rings, seals, and wipers.",                           tags: ["seal", "hydraulic", "cylinder"] },
    { name: "Hydraulic Hose 3/8 inch × 1 metre",      unit: "meter", price: 420,  stock: 60,  description: "High-pressure hydraulic hose. 3/8 inch bore. Rated to 280 bar. Stainless steel end fittings.",                           tags: ["hose", "hydraulic", "high-pressure"] },
    { name: "Hydraulic Quick Coupler Set",             unit: "set",   price: 890,  stock: 45,  description: "BSP 1/2 inch hydraulic quick release coupler. Includes male and female halves. Carbon steel.",                            tags: ["coupler", "hydraulic", "quick-release"] },
    { name: "Hydraulic Oil 68 — 5 Litre Can",         unit: "can",   price: 750,  stock: 90,  description: "ISO 68 grade hydraulic oil. 5-litre can. Suitable for most industrial hydraulic systems.",                                tags: ["oil", "hydraulic", "iso68"] },
  ],
  Bearings: [
    { name: "SKF 6203-2RS Deep Groove Ball Bearing",   unit: "piece", price: 185,  stock: 200, description: "SKF 6203-2RS sealed deep groove ball bearing. 17mm ID, 40mm OD. Standard stock item.",                                   tags: ["bearing", "skf", "6203"] },
    { name: "FAG 6305 Open Bearing",                  unit: "piece", price: 220,  stock: 160, description: "FAG 6305 open-type ball bearing. 25mm ID, 62mm OD. High load capacity.",                                                 tags: ["bearing", "fag", "6305"] },
    { name: "Taper Roller Bearing 30205",              unit: "piece", price: 680,  stock: 75,  description: "30205 taper roller bearing. Suitable for axial and radial loads. 25mm ID, 52mm OD.",                                     tags: ["bearing", "taper", "roller"] },
    { name: "Needle Roller Bearing HK2020",           unit: "piece", price: 310,  stock: 100, description: "HK2020 drawn cup needle roller bearing. 20mm ID, 26mm OD. Compact design for tight spaces.",                             tags: ["bearing", "needle", "hk2020"] },
  ],
  Tools: [
    { name: "Bosch GSB 550 Drill Chuck (Genuine)",    unit: "piece", price: 890,  stock: 25,  description: "Genuine Bosch replacement chuck for GSB 550 drill. 13mm capacity. 1/2-20 UNF thread.",                                   tags: ["drill", "chuck", "bosch"] },
    { name: "Combination Spanner Set 8–22mm (8 pcs)", unit: "set",   price: 1450, stock: 40,  description: "Chrome-vanadium steel combination spanner set. 8 spanners from 8mm to 22mm. Mirror polished.",                           tags: ["spanner", "wrench", "set"] },
    { name: "Digital Vernier Caliper 150mm",          unit: "piece", price: 680,  stock: 55,  description: "Stainless steel digital vernier caliper. 0–150mm range. Resolution 0.01mm. IP54 splash-proof.",                          tags: ["caliper", "vernier", "measuring"] },
    { name: "Torque Wrench 1/2 inch Drive 20–110 Nm", unit: "piece", price: 2200, stock: 20,  description: "Click-type torque wrench. 1/2 inch drive. Range 20–110 Nm. ±4% accuracy.",                                               tags: ["torque", "wrench", "1/2inch"] },
    { name: "Angle Grinder 4.5 inch 850W",           unit: "piece", price: 3200, stock: 15,  description: "850W angle grinder with 115mm disc. Variable speed. Includes side handle and disc guard.",                                tags: ["grinder", "angle", "850w"] },
  ],
  "Pipes & Fittings": [
    { name: "2-inch Brass Gate Valve ISI",            unit: "piece", price: 480,  stock: 60,  description: "ISI marked 2-inch brass gate valve for water supply. Full bore. PN16 rated.",                                             tags: ["valve", "brass", "gate"] },
    { name: "UPVC Elbow 90° 25mm (pack of 10)",       unit: "pack",  price: 120,  stock: 200, description: "25mm UPVC 90-degree elbow. Solvent-cement type. Pack of 10. For water and drainage systems.",                            tags: ["elbow", "upvc", "fitting"] },
    { name: "GI Pipe 1 inch Class B (per metre)",     unit: "meter", price: 190,  stock: 500, description: "Galvanised iron pipe, 1 inch nominal bore, Class B (medium). Cut to length available.",                                  tags: ["pipe", "gi", "galvanised"] },
    { name: "PPR Pipe 25mm PN20 (4 metre length)",    unit: "piece", price: 360,  stock: 150, description: "PN20 PPR hot and cold water pipe. 25mm OD, 4m length. Suitable for hot water up to 70°C.",                               tags: ["pipe", "ppr", "hot-water"] },
  ],
  Electrical: [
    { name: "Schneider 32A Single Pole MCB C-Curve",  unit: "piece", price: 420,  stock: 80,  description: "Schneider iC60N 32A single-pole MCB. C-curve. 6kA breaking capacity. DIN rail mount.",                                  tags: ["mcb", "schneider", "32a"] },
    { name: "Legrand 16A 5-pin Industrial Socket",    unit: "piece", price: 780,  stock: 50,  description: "Legrand P17 Tempra Pro 16A 3P+N+E industrial socket. IP44 rated. 380-415V.",                                             tags: ["socket", "legrand", "industrial"] },
    { name: "1.5 sq mm Copper Wire 90m Roll",         unit: "roll",  price: 1650, stock: 40,  description: "1.5 sq mm FR PVC insulated copper wire. 90m roll. 660/1000V rated. Red colour.",                                         tags: ["wire", "copper", "1.5sqmm"] },
    { name: "Double Pole RCCB 25A 30mA",              unit: "piece", price: 1100, stock: 35,  description: "25A double pole RCCB. 30mA sensitivity. Type A. For shock protection in residential panels.",                            tags: ["rccb", "25a", "safety"] },
  ],
  Mechanical: [
    { name: "Single Phase 1HP Induction Motor",       unit: "piece", price: 4800, stock: 12,  description: "1HP 220V single-phase induction motor. 1440 RPM. Foot mounting. B3 flange. IP55 protection.",                           tags: ["motor", "1hp", "induction"] },
    { name: "V-Belt A-Section A40",                   unit: "piece", price: 95,   stock: 200, description: "Classical A-section V-belt. A40 size (1016mm effective length). Oil and heat resistant.",                                tags: ["belt", "v-belt", "a40"] },
    { name: "Flexible Shaft Coupling 20mm",           unit: "piece", price: 450,  stock: 60,  description: "Jaw-type flexible coupling. 20mm bore. Spider insert included. Max 6000 RPM.",                                           tags: ["coupling", "shaft", "flexible"] },
    { name: "Steel Sprocket 20T 1 inch Bore",         unit: "piece", price: 380,  stock: 45,  description: "20-tooth steel sprocket for #40/41 roller chain. 1-inch bore. Hardened teeth.",                                          tags: ["sprocket", "chain", "steel"] },
  ],
};

const PART_REQUESTS = [
  { title: "Looking for 2-inch brass gate valve", description: "Need 2-inch brass gate valve for water supply line. ISI marked preferred. Need 3 pieces.", category: "Pipes & Fittings", city: "Mumbai",    location: "Andheri West, Mumbai",        quantity: "3",  size: "2 inch" },
  { title: "MCB 32A single pole — urgent",         description: "Tripped and broke. Need a Legrand or Schneider 32A single-pole MCB urgently.",            category: "Electrical",       city: "Pune",      location: "Shivajinagar, Pune",          quantity: "1",  size: "32A" },
  { title: "M12 hex bolts — 50 pcs",              description: "50 pieces of M12 × 40mm stainless steel hex bolts with matching nuts. Grade 8.8.",         category: "Fasteners",        city: "Delhi",     location: "Karol Bagh, Delhi",           quantity: "50", size: "M12 x 40mm" },
  { title: "Bosch drill chuck replacement",        description: "Drill chuck for Bosch GSB 550 stripped out. Looking for genuine replacement.",             category: "Tools",            city: "Bengaluru", location: "Indiranagar, Bengaluru",      quantity: "1",  size: "" },
  { title: "Hydraulic cylinder seal kit 50mm",     description: "Seal kit for 50mm bore hydraulic cylinder used in an industrial press.",                  category: "Hydraulic",        city: "Chennai",   location: "Guindy Industrial Estate",    quantity: "2",  size: "50mm bore" },
  { title: "6203 ball bearings × 10 pieces",       description: "Standard 6203-2RS bearings. Need 10 pieces. SKF or FAG preferred.",                       category: "Bearings",         city: "Hyderabad", location: "Nacharam Industrial Area",    quantity: "10", size: "6203-2RS" },
  { title: "Single phase 1HP motor",               description: "Replacement 1HP 220V single-phase induction motor for a water pump.",                     category: "Mechanical",       city: "Ahmedabad", location: "Naroda GIDC, Ahmedabad",      quantity: "1",  size: "1HP 220V" },
  { title: "PPR pipe 25mm 10 metres",              description: "Need 10 metres of 25mm PN20 PPR pipe for hot water plumbing.",                            category: "Pipes & Fittings", city: "Kolkata",   location: "Salt Lake Sector V, Kolkata", quantity: "10", size: "25mm PN20" },
];

const RESPONSE_MESSAGES = [
  "In stock and ready to dispatch within 24 hours. Price includes GST.",
  "Available from our warehouse. Can deliver tomorrow. Genuine product with warranty.",
  "Sourced from a trusted supplier. Comes with 6-month replacement warranty.",
  "In stock. We can provide installation support if required at extra cost.",
  "Genuine brand item. Multiple units available for immediate dispatch.",
  "We have this in stock. Best price guaranteed. Bulk discounts available.",
];

const DELIVERY_TIMES = ["Same day", "Next day", "1–2 days", "2–3 days", "3–5 days"];

// ── Helpers ────────────────────────────────────────────────────────────────

const pick     = (arr)      => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, n)   => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const rand     = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Option 1: picsum.photos URL builder ───────────────────────────────────
// Uses a numeric seed so the same lock always returns the same image.
// The `keyword` param is accepted for API compatibility but not used by picsum.
const flickrUrl = (keyword, w = 640, h = 480, lock = rand(1, 9999)) =>
  `https://picsum.photos/seed/${lock}/${w}/${h}`;

// ── Option 3: Cloudinary direct fetch (no manual fetchBuffer) ─────────────
// Cloudinary fetches the image itself from the remote URL — no https/http
// boilerplate needed. Falls back to "" on any error so seeding never aborts.
async function uploadImageToCloudinary(remoteUrl, folder, publicIdHint) {
  try {
    const result = await cloudinary.uploader.upload(remoteUrl, {
      folder,
      public_id:      publicIdHint,
      overwrite:      true,
      resource_type:  "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`   ⚠ Image upload failed (${publicIdHint}): ${err.message}`);
    return "";
  }
}

// ── Clear ──────────────────────────────────────────────────────────────────

async function clearCollections() {
  console.log("🗑  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Shop.deleteMany({}),
    Product.deleteMany({}),
    Request.deleteMany({}),
    Response.deleteMany({}),
  ]);
  console.log("✅ All collections cleared.\n");
}

// ── Seed Users ─────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("👤 Seeding users...");
  const password = await bcrypt.hash("Password123!", 10);

  const adminAvatar = await uploadImageToCloudinary(
    flickrUrl("person portrait", 200, 200, 1),
    "hardwarehub/avatars",
    "seed_admin"
  );

  const customerAvatars = await Promise.all(
    ["rahul", "priya", "aakash", "sunita"].map((name, i) =>
      uploadImageToCloudinary(
        flickrUrl("person portrait", 200, 200, i + 10),
        "hardwarehub/avatars",
        `seed_customer_${name}`
      )
    )
  );

  const shopOwnerAvatars = await Promise.all(
    SHOPS.map((s, i) =>
      uploadImageToCloudinary(
        flickrUrl("person portrait", 200, 200, i + 20),
        "hardwarehub/avatars",
        `seed_owner_${i + 1}`
      )
    )
  );

  const users = [
    { name: "Admin User",   email: "admin@hardwarehub.com", password, role: "admin",    avatar: adminAvatar,        provider: "credentials", isActive: true },
    { name: "Rahul Mehta",  email: "customer1@example.com", password, role: "customer", avatar: customerAvatars[0], provider: "credentials", isActive: true },
    { name: "Priya Sharma", email: "customer2@example.com", password, role: "customer", avatar: customerAvatars[1], provider: "credentials", isActive: true },
    { name: "Aakash Patel", email: "customer3@example.com", password, role: "customer", avatar: customerAvatars[2], provider: "credentials", isActive: true },
    { name: "Sunita Verma", email: "customer4@example.com", password, role: "customer", avatar: customerAvatars[3], provider: "credentials", isActive: true },
    ...SHOPS.map((s, i) => ({
      name:     `Owner — ${s.name}`,
      email:    `shop${i + 1}@example.com`,
      password,
      role:     "shop_owner",
      avatar:   shopOwnerAvatars[i],
      provider: "credentials",
      isActive: true,
    })),
  ];

  const created = await User.insertMany(users);
  console.log(`   ✔ ${created.length} users`);
  return created;
}

// ── Seed Shops ─────────────────────────────────────────────────────────────

async function seedShops(owners) {
  console.log("🏪 Seeding shops + logos...");

  const logos = await Promise.all(
    SHOPS.map((s, i) =>
      uploadImageToCloudinary(
        flickrUrl("hardware store shop", 400, 400, i + 50),
        "hardwarehub/shops",
        `seed_shop_logo_${i + 1}`
      )
    )
  );

  const shops = SHOPS.map((s, i) => ({
    owner:        owners[i]._id,
    name:         s.name,
    description:  s.description,
    logo:         logos[i],
    location:     `${rand(1, 200)}, ${pick(["MG Road", "Station Road", "Industrial Area", "Market Street", "Main Bazaar"])}`,
    city:         CITIES[i % CITIES.length],
    phone:        `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`,
    whatsapp:     `+91 ${rand(70000, 99999)}${rand(10000, 99999)}`,
    email:        `shop${i + 1}@example.com`,
    categories:   s.categories,
    rating:       parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    totalReviews: rand(5, 120),
    isApproved:   true,
    isActive:     true,
  }));

  const created = await Shop.insertMany(shops);
  console.log(`   ✔ ${created.length} shops`);
  return created;
}

// ── Seed Products ──────────────────────────────────────────────────────────

async function seedProducts(shops) {
  console.log("📦 Seeding products + images (this may take a minute)...");

  const products = [];
  let imgCounter = 100;

  for (const shop of shops) {
    for (const category of shop.categories) {
      const items = PRODUCTS_BY_CATEGORY[category] || [];

      for (const item of items) {
        // Upload 2 images per product in parallel
        const [img1, img2] = await Promise.all([
          uploadImageToCloudinary(
            flickrUrl(category, 640, 480, imgCounter++),
            "hardwarehub/products",
            `seed_product_${imgCounter}`
          ),
          uploadImageToCloudinary(
            flickrUrl(category, 640, 480, imgCounter++),
            "hardwarehub/products",
            `seed_product_${imgCounter}`
          ),
        ]);

        products.push({
          shop:         shop._id,
          name:         item.name,
          description:  item.description,
          category,
          brand:        "",
          model:        "",
          tags:         item.tags || [],
          price:        item.price,
          unit:         item.unit,
          stock:        item.stock,
          images:       [img1, img2].filter(Boolean),
          rating:       parseFloat((3 + Math.random() * 2).toFixed(1)),
          totalReviews: rand(0, 40),
          isActive:     true,
        });
      }
    }
  }

  const created = await Product.insertMany(products);
  console.log(`   ✔ ${created.length} products`);
  return created;
}

// ── Seed Part Requests ─────────────────────────────────────────────────────

async function seedRequests(customers) {
  console.log("📋 Seeding part requests + images...");

  let imgCounter = 500;
  const requests = [];

  for (let i = 0; i < PART_REQUESTS.length; i++) {
    const r = PART_REQUESTS[i];

    const imageUrl = await uploadImageToCloudinary(
      flickrUrl(r.category, 800, 600, imgCounter++),
      "hardwarehub/requests",
      `seed_request_${i + 1}`
    );

    requests.push({
      user:          customers[i % customers.length]._id,
      title:         r.title,
      description:   r.description,
      image:         imageUrl,
      imagePublicId: `hardwarehub/requests/seed_request_${i + 1}`,
      quantity:      r.quantity,
      size:          r.size,
      brand:         "",
      category:      r.category,
      location:      r.location,
      city:          r.city,
      status:        pick(["open", "open", "open", "responded", "closed"]),
      responseCount: 0,
      views:         rand(0, 80),
    });
  }

  const created = await Request.insertMany(requests);
  console.log(`   ✔ ${created.length} part requests`);
  return created;
}

// ── Seed Responses ─────────────────────────────────────────────────────────

async function seedResponses(requests, shops) {
  console.log("💬 Seeding responses...");
  const responses = [];

  for (const req of requests) {
    if (req.status === "closed") continue;
    const selected = pickMany(shops, rand(1, 3));

    for (const shop of selected) {
      responses.push({
        request:      req._id,
        shop:         shop._id,
        shopOwner:    shop.owner,
        price:        `₹${rand(200, 5000)}`,
        message:      pick(RESPONSE_MESSAGES),
        deliveryTime: pick(DELIVERY_TIMES),
        inStock:      Math.random() > 0.2,
        isAccepted:   false,
      });
    }

    await Request.findByIdAndUpdate(req._id, {
      responseCount: selected.length,
      status: selected.length > 0 && req.status === "open" ? "responded" : req.status,
    });
  }

  const created = await Response.insertMany(responses);
  console.log(`   ✔ ${created.length} responses`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const required = ["MONGODB_URI", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const missing  = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected.\n");

  if (CLEAR_FIRST) await clearCollections();
  if (CLEAR_ONLY)  { await mongoose.disconnect(); console.log("Done."); return; }

  const allUsers   = await seedUsers();
  const customers  = allUsers.filter((u) => u.role === "customer");
  const shopOwners = allUsers.filter((u) => u.role === "shop_owner");

  const shops    = await seedShops(shopOwners);
  await seedProducts(shops);
  const requests = await seedRequests(customers);
  await seedResponses(requests, shops);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────────");
  console.log("  Test accounts  (password: Password123!)");
  console.log("─────────────────────────────────────────────────");
  console.log("  Admin       admin@hardwarehub.com");
  console.log("  Customer    customer1@example.com");
  console.log("  Shop Owner  shop1@example.com");
  console.log("─────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});