import { connectDB } from "../src/lib/db/connect";
import { Hostel, Category, MenuItem, User, Coupon } from "../src/models";
import { hashPassword } from "../src/lib/auth/password";
import { slugify } from "../src/lib/utils/slugify";
import { FOOD_TYPE, SPICE_LEVEL, ITEM_TAG, USER_ROLE, USER_STATUS } from "../src/constants";

const HOSTELS = [
  { name: "Mithali Girls Hostel", code: "MGH" },
  { name: "Gavaskar Boys Hostel", code: "GBH" },
  { name: "Tendulkar Boys Hostel", code: "TBH" },
  { name: "Virat Boys Hostel", code: "VBH" },
];

const CATEGORIES = [
  "Thali",
  "Starters",
  "South Indian",
  "Rice",
  "Chinese",
  "Snacks",
  "Beverages",
  "Desserts",
  "Breads",
] as const;

type Category = (typeof CATEGORIES)[number];

interface SeedItem {
  name: string;
  category: Category;
  image: string;
  price: number;
  discountPrice?: number;
  foodType: string;
  spiceLevel?: string;
  tags?: string[];
  prepTimeMinutes?: number;
}

const ITEMS: SeedItem[] = [
  { name: "Special Veg Thali", category: "Thali", image: "Special-Veg-Thali.webp", price: 180, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.TODAYS_SPECIAL], prepTimeMinutes: 20 },
  { name: "Special Non-Veg Thali", category: "Thali", image: "Special-Non-Veg-Thali.webp", price: 220, foodType: FOOD_TYPE.NON_VEG, spiceLevel: SPICE_LEVEL.MEDIUM, tags: [ITEM_TAG.TODAYS_SPECIAL], prepTimeMinutes: 25 },
  { name: "Steam Momos", category: "Starters", image: "Steam-Momos.webp", price: 120, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 15 },
  { name: "Spring Roll", category: "Starters", image: "Spring-Roll.webp", price: 110, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, prepTimeMinutes: 15 },
  { name: "Chicken Roll", category: "Starters", image: "Chicken-Roll.webp", price: 140, discountPrice: 125, foodType: FOOD_TYPE.NON_VEG, spiceLevel: SPICE_LEVEL.MEDIUM, tags: [ITEM_TAG.BEST_SELLER], prepTimeMinutes: 18 },
  { name: "Egg Roll", category: "Starters", image: "Egg-Roll.webp", price: 100, foodType: FOOD_TYPE.EGG, spiceLevel: SPICE_LEVEL.MILD, prepTimeMinutes: 15 },
  { name: "Paneer Roll", category: "Starters", image: "Paneer-Roll.webp", price: 130, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, tags: [ITEM_TAG.RECOMMENDED], prepTimeMinutes: 15 },
  { name: "Masala Dosa", category: "South Indian", image: "Masala-Dosa.webp", price: 90, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 20 },
  { name: "Special Masala Dosa", category: "South Indian", image: "Special-Masala-Dosa.webp", price: 130, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.TODAYS_SPECIAL], prepTimeMinutes: 22 },
  { name: "Veg Fried Rice", category: "Rice", image: "Veg-Fried-Rice.webp", price: 130, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, prepTimeMinutes: 18 },
  { name: "Non-Veg Fried Rice", category: "Rice", image: "Non-Veg-Fried-Rice.webp", price: 170, foodType: FOOD_TYPE.NON_VEG, spiceLevel: SPICE_LEVEL.MEDIUM, tags: [ITEM_TAG.BEST_SELLER], prepTimeMinutes: 20 },
  { name: "Veg Noodles", category: "Chinese", image: "Veg-Noodles.webp", price: 120, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, prepTimeMinutes: 15 },
  { name: "Non-Veg Noodles", category: "Chinese", image: "Non-Veg-Noodles.webp", price: 160, foodType: FOOD_TYPE.NON_VEG, spiceLevel: SPICE_LEVEL.MEDIUM, prepTimeMinutes: 18 },
  { name: "Veg Macaroni", category: "Chinese", image: "Veg-Macaroni.webp", price: 125, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 15 },
  { name: "Non-Veg Macaroni", category: "Chinese", image: "Non-Veg-Macaroni.webp", price: 165, foodType: FOOD_TYPE.NON_VEG, spiceLevel: SPICE_LEVEL.MILD, prepTimeMinutes: 18 },
  { name: "White Sauce Pasta", category: "Chinese", image: "White-Sauce-Pasta.webp", price: 150, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.RECOMMENDED], prepTimeMinutes: 18 },
  { name: "Red Sauce Pasta", category: "Chinese", image: "Red-Sauce-Pasta.webp", price: 150, foodType: FOOD_TYPE.VEG, spiceLevel: SPICE_LEVEL.MILD, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 18 },
  { name: "Aloo Tikki Burger", category: "Snacks", image: "Aloo-Tikki-Burger.webp", price: 90, discountPrice: 75, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.BEST_SELLER], prepTimeMinutes: 12 },
  { name: "Supreme Burger", category: "Snacks", image: "Supreme-Burger.webp", price: 140, foodType: FOOD_TYPE.NON_VEG, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 15 },
  { name: "Max Sandwich", category: "Snacks", image: "Max-Sandwich.webp", price: 110, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 10 },
  { name: "Veg Sandwich", category: "Snacks", image: "Veg-Sandwich.webp", price: 80, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 10 },
  { name: "Veg Club Sandwich", category: "Snacks", image: "Veg-Club-Sandwich.webp", price: 130, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.RECOMMENDED], prepTimeMinutes: 12 },
  { name: "Buttered Toast", category: "Snacks", image: "Toast.webp", price: 60, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 8 },
  { name: "Cold Coffee", category: "Beverages", image: "Cold-Coffee.webp", price: 80, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 5 },
  { name: "Chocolate Shake", category: "Beverages", image: "Chocolate-Shake.webp", price: 100, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.BEST_SELLER], prepTimeMinutes: 5 },
  { name: "Gulab Jamun (2 pc)", category: "Desserts", image: "Gulab-Jamun.webp", price: 60, foodType: FOOD_TYPE.VEG, tags: [ITEM_TAG.POPULAR], prepTimeMinutes: 5 },
  { name: "Chocolate Cake Slice", category: "Desserts", image: "Cake-Slice.webp", price: 90, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 5 },
  { name: "Tawa Roti", category: "Breads", image: "Roti.webp", price: 20, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 8 },
  { name: "Tandoori Roti", category: "Breads", image: "Tandoori-Roti.webp", price: 25, foodType: FOOD_TYPE.VEG, prepTimeMinutes: 10 },
];

async function main() {
  await connectDB();
  console.log("Connected. Seeding...");

  const hostelDocs = await Promise.all(
    HOSTELS.map((h, i) =>
      Hostel.findOneAndUpdate(
        { code: h.code },
        { $set: { name: h.name, code: h.code, isActive: true, sortOrder: i } },
        { upsert: true, returnDocument: "after" }
      )
    )
  );
  console.log(`Hostels: ${hostelDocs.length}`);

  const categoryMap = new Map<Category, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const name = CATEGORIES[i];
    const doc = await Category.findOneAndUpdate(
      { slug: slugify(name) },
      { $set: { name, slug: slugify(name), sortOrder: i, isActive: true } },
      { upsert: true, returnDocument: "after" }
    );
    categoryMap.set(name, String(doc!._id));
  }
  console.log(`Categories: ${categoryMap.size}`);

  let itemCount = 0;
  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const slug = slugify(item.name);
    await MenuItem.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: item.name,
          slug,
          description: `Freshly prepared ${item.name.toLowerCase()}, made to order and delivered hot.`,
          category: categoryMap.get(item.category),
          price: item.price,
          discountPrice: item.discountPrice,
          images: [{ url: `/images/menu/${item.image}`, fileId: "local-seed", isPrimary: true }],
          isAvailable: true,
          isHidden: false,
          prepTimeMinutes: item.prepTimeMinutes ?? 15,
          foodType: item.foodType,
          spiceLevel: item.spiceLevel ?? SPICE_LEVEL.NONE,
          tags: item.tags ?? [],
          inStock: true,
          sortOrder: i,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    itemCount++;
  }
  console.log(`Menu items: ${itemCount}`);

  const adminEmail = "admin@qcafe.local";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "QCafe Admin",
      email: adminEmail,
      passwordHash: await hashPassword("Admin@12345"),
      role: USER_ROLE.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
      emailVerifiedAt: new Date(),
      hostel: hostelDocs[0]!._id,
    });
    console.log(`Admin user created: ${adminEmail} / Admin@12345`);
  } else {
    console.log("Admin user already exists");
  }

  await Coupon.findOneAndUpdate(
    { code: "WELCOME10" },
    {
      $set: {
        code: "WELCOME10",
        description: "10% off your first order",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 100,
        maxDiscountAmount: 50,
        isActive: true,
        validFrom: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("Coupon: WELCOME10");

  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
