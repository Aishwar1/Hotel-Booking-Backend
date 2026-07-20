// ============================================================
// SEED SCRIPT — QuickStay
// ============================================================
// Creates 4 hotels (one per city) and 3–4 rooms each,
// giving the app 14 rooms of varied types and prices to show.
//
// Run once from the server/ directory:
//   node seed.js
//
// Safe to re-run — it checks for existing hotels before inserting.
// ============================================================

import "dotenv/config";
import mongoose from "mongoose";
import Hotel from "./models/Hotel.js";
import Room  from "./models/Room.js";

// ── Unsplash room images (free, no key needed) ──
// Four images per room give the details carousel something to show.
const ROOM_IMAGES = {
    deluxe: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80",
    ],
    suite: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80",
    ],
    single: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80",
        "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    ],
    penthouse: [
        "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?w=800&q=80",
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80",
        "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
        "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&q=80",
    ],
};

// ── Hotel + room definitions ──
// owner is set to "seed_admin" — a placeholder string.
// If you want rooms to show up under a real hotel-owner account,
// replace "seed_admin" with your actual Clerk user ID.
const SEED_DATA = [
    {
        hotel: {
            name:    "Aria Grand Dubai",
            address: "Sheikh Zayed Road, Downtown Dubai, UAE",
            contact: "+971-4-123-4567",
            city:    "Dubai",
            owner:   "seed_admin",
        },
        rooms: [
            { roomType: "Single Bed",     pricePerNight: 199, amenities: ["Free WiFi", "Room Service", "Pool Access"],                    images: ROOM_IMAGES.single   },
            { roomType: "Double Bed",     pricePerNight: 299, amenities: ["Free WiFi", "Free Breakfast", "Room Service"],                 images: ROOM_IMAGES.deluxe   },
            { roomType: "Double Bed",     pricePerNight: 399, amenities: ["Free WiFi", "Pool Access", "Mountain View", "Room Service"],   images: ROOM_IMAGES.suite    },
            { roomType: "Luxury Suite",   pricePerNight: 699, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"],  images: ROOM_IMAGES.penthouse},
        ],
    },
    {
        hotel: {
            name:    "Marina Bay Prestige",
            address: "10 Bayfront Avenue, Marina Bay, Singapore",
            contact: "+65-6123-4567",
            city:    "Singapore",
            owner:   "seed_admin",
        },
        rooms: [
            { roomType: "Single Bed",     pricePerNight: 179, amenities: ["Free WiFi", "Room Service"],                                  images: ROOM_IMAGES.single   },
            { roomType: "Double Bed",     pricePerNight: 279, amenities: ["Free WiFi", "Free Breakfast", "Pool Access"],                 images: ROOM_IMAGES.deluxe   },
            { roomType: "Luxury Suite",   pricePerNight: 549, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ROOM_IMAGES.suite    },
            { roomType: "Penthouse Suite",pricePerNight: 899, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ROOM_IMAGES.penthouse},
        ],
    },
    {
        hotel: {
            name:    "Urbanza Suites New York",
            address: "45 West 57th Street, Midtown Manhattan, NY",
            contact: "+1-212-555-0100",
            city:    "New York",
            owner:   "seed_admin",
        },
        rooms: [
            { roomType: "Single Bed",     pricePerNight: 249, amenities: ["Free WiFi", "Room Service"],                                  images: ROOM_IMAGES.single   },
            { roomType: "Double Bed",     pricePerNight: 349, amenities: ["Free WiFi", "Free Breakfast", "Room Service"],                images: ROOM_IMAGES.deluxe   },
            { roomType: "Double Bed",     pricePerNight: 449, amenities: ["Free WiFi", "Pool Access", "Mountain View", "Room Service"],  images: ROOM_IMAGES.suite    },
        ],
    },
    {
        hotel: {
            name:    "The Kensington London",
            address: "109 Queen's Gate, South Kensington, London",
            contact: "+44-20-7123-4567",
            city:    "London",
            owner:   "seed_admin",
        },
        rooms: [
            { roomType: "Single Bed",     pricePerNight: 219, amenities: ["Free WiFi", "Room Service"],                                  images: ROOM_IMAGES.single   },
            { roomType: "Double Bed",     pricePerNight: 319, amenities: ["Free WiFi", "Free Breakfast", "Room Service"],                images: ROOM_IMAGES.deluxe   },
            { roomType: "Luxury Suite",   pricePerNight: 599, amenities: ["Free WiFi", "Free Breakfast", "Pool Access", "Room Service"], images: ROOM_IMAGES.suite    },
        ],
    },
];

async function seed() {
    console.log("🌱  Connecting to database…");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "hotel-booking" });
    console.log("✅  Connected.");

    let hotelsCreated = 0;
    let roomsCreated  = 0;

    for (const entry of SEED_DATA) {
        // Skip if a hotel with this name already exists (idempotent)
        const existing = await Hotel.findOne({ name: entry.hotel.name });
        if (existing) {
            console.log(`⏭️   Hotel "${entry.hotel.name}" already exists — skipping.`);
            continue;
        }

        const hotel = await Hotel.create(entry.hotel);
        hotelsCreated++;
        console.log(`🏨  Created hotel: ${hotel.name} (${hotel.city})`);

        for (const roomData of entry.rooms) {
            await Room.create({ ...roomData, hotel: hotel._id, isAvailable: true });
            roomsCreated++;
            console.log(`   🛏️   ${roomData.roomType}  — $${roomData.pricePerNight}/night`);
        }
    }

    console.log(`\n🎉  Seed complete: ${hotelsCreated} hotel(s), ${roomsCreated} room(s) added.`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
});
