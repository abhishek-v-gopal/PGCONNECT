/**
 * Seed script — run with: npm run seed
 * Clears DB and inserts sample admin, owners, students, and properties.
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const User     = require("../models/user.model");
const Property = require("../models/property.model");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  DB connected");

    // ── Wipe ──────────────────────────────────────────────
    await Promise.all([User.deleteMany(), Property.deleteMany()]);
    console.log("🗑️   Collections cleared");

    // ── Users ─────────────────────────────────────────────
    const hash = (pw) => bcrypt.hash(pw, 12);

    const [admin, owner1, owner2, student1, student2] = await User.insertMany([
      { name: "Super Admin",   email: "admin@pgconnect.com",   password: await hash("Admin@123"),   role: "admin",   isVerifiedOwner: false },
      { name: "Rajesh Kumar",  email: "rajesh@pgconnect.com",  password: await hash("Owner@123"),   role: "owner",   isVerifiedOwner: true,  isPremiumOwner: true, phone: "+91 9876543210" },
      { name: "Sarah Jenkins", email: "sarah@pgconnect.com",   password: await hash("Owner@123"),   role: "owner",   isVerifiedOwner: true,  phone: "+91 9123456780" },
      { name: "Aditya Kapoor", email: "aditya@university.edu", password: await hash("Student@123"), role: "student", university: "IIT Delhi" },
      { name: "Meera Sharma",  email: "meera@iit.ac.in",       password: await hash("Student@123"), role: "student", university: "IIT Bombay" },
    ]);
    console.log("👤  Users seeded");

    // ── Properties ────────────────────────────────────────
    await Property.insertMany([
      {
        owner: owner1._id,
        name: "The Nordic House",
        tagline: "Calm Scandinavian living in the heart of South Delhi.",
        location: { address: "Hauz Khas Village", city: "New Delhi", landmark: "Near Hauz Khas Metro", mapLabel: "4th Floor, Hauz Khas Village" },
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"],
        amenities: ["High-Speed Wi-Fi", "Laundry", "Daily Meals", "24/7 Security", "Air Conditioning"],
        rooms: [
          { type: "Double", price: 18500, totalBeds: 8, availableBeds: 4, description: "Twin beds, private wardrobe" },
          { type: "Triple", price: 14000, totalBeds: 6, availableBeds: 2, description: "Bunk beds, shared bathroom" },
          { type: "Single", price: 26000, totalBeds: 4, availableBeds: 0, description: "Queen bed, en-suite bathroom" },
        ],
        gender: "Co-ed",
        startingPrice: 14000,
        manager: { name: "Rajesh Kumar", phone: "+91 9876543210" },
        status: "verified", isVerified: true, verifiedAt: new Date(), verifiedBy: admin._id,
        rating: 4.9, totalRatings: 120,
      },
      {
        owner: owner1._id,
        name: "Skyloft Co-Living",
        tagline: "Industrial-chic co-living for Bangalore's creative class.",
        location: { address: "5th Block, Koramangala", city: "Bangalore", landmark: "Near Forum Mall", mapLabel: "5th Block, Koramangala" },
        images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"],
        amenities: ["High-Speed Wi-Fi", "On-site Gym", "EV Charging", "Housekeeping"],
        rooms: [
          { type: "Double", price: 15000, totalBeds: 10, availableBeds: 2, description: "Twin beds, attached balcony" },
          { type: "Single", price: 22000, totalBeds: 4,  availableBeds: 1, description: "King bed, en-suite" },
        ],
        gender: "Boys",
        startingPrice: 15000,
        manager: { name: "Rajesh Kumar", phone: "+91 9876543210" },
        status: "verified", isVerified: true, verifiedAt: new Date(), verifiedBy: admin._id,
        rating: 4.8, totalRatings: 95,
      },
      {
        owner: owner2._id,
        name: "The Urban Loft",
        tagline: "Modern loft living in the heart of Pune.",
        location: { address: "Viman Nagar", city: "Pune", landmark: "Near Pune Airport", mapLabel: "Viman Nagar, Pune" },
        images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80"],
        amenities: ["Wi-Fi", "Laundry", "24/7 Security"],
        rooms: [
          { type: "Single", price: 19000, totalBeds: 6, availableBeds: 3, description: "Private room, balcony" },
          { type: "Double", price: 12000, totalBeds: 8, availableBeds: 5, description: "Shared room, city view" },
        ],
        gender: "Girls",
        startingPrice: 12000,
        manager: { name: "Sarah Jenkins", phone: "+91 9123456780" },
        status: "pending",
        rating: 0, totalRatings: 0,
      },
    ]);
    console.log("🏠  Properties seeded");

    console.log("\n🎉  Seed complete! Test credentials:");
    console.log("   Admin:   admin@pgconnect.com  /  Admin@123");
    console.log("   Owner:   rajesh@pgconnect.com /  Owner@123");
    console.log("   Student: aditya@university.edu / Student@123");

    process.exit(0);
  } catch (err) {
    console.error("❌  Seed error:", err);
    process.exit(1);
  }
};

seed();