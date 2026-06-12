/**
 * scripts/seed.ts
 * ─────────────────
 * Populates the development database with 4 test users and sample
 * relationships so you can test the UI immediately after setup.
 *
 * Run: npm run seed
 *
 * Seeded state
 * ────────────
 *   alice  ↔  bob     confirmed friends
 *   carol  →  alice   pending request
 *   dave   →  alice   rejected request
 *
 * All passwords: password123
 * Idempotent — safe to run multiple times.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/database";
import { User }          from "../src/models/User.model";
import { FriendRequest } from "../src/models/FriendRequest.model";
import { Friendship }    from "../src/models/Friendship.model";
import { canonicalPair } from "../src/utils/friendship";

// ── User definitions ──────────────────────────────────────────────────────────

const USERS = [
  { username: "alice", email: "alice@example.com", displayName: "Alice" },
  { username: "bob",   email: "bob@example.com",   displayName: "Bob"   },
  { username: "carol", email: "carol@example.com", displayName: "Carol" },
  { username: "dave",  email: "dave@example.com",  displayName: "Dave"  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  await connectDB();
  console.log("\n🌱 Seeding database…\n");

  // ── Upsert users ─────────────────────────────────────────────────────────────
  const ids: Record<string, mongoose.Types.ObjectId> = {};

  for (const u of USERS) {
    let doc = await User.findOne({ email: u.email });
    if (!doc) {
      doc = await User.create({
        ...u,
        passwordHash: "password123",   // pre-save hook hashes this
        cometChatUid: "",              // filled after _id is assigned
        isActive: true,
      });
      doc.cometChatUid = doc._id.toString();
      await doc.save();
      console.log(`  ✓ Created user: ${u.username}`);
    } else {
      console.log(`  · Skipped (exists): ${u.username}`);
    }
    ids[u.username] = doc._id as mongoose.Types.ObjectId;
  }

  // ── Alice ↔ Bob — confirmed friendship ───────────────────────────────────────
  const existingAliceBob = await FriendRequest.findOne({
    senderId: ids.alice, receiverId: ids.bob,
  });

  if (!existingAliceBob) {
    const req = await FriendRequest.create({
      senderId:    ids.alice,
      receiverId:  ids.bob,
      status:      "ACCEPTED",
      respondedAt: new Date(),
    });
    const [userAId, userBId] = canonicalPair(ids.alice, ids.bob);
    await Friendship.create({ userAId, userBId, friendRequestId: req._id });
    console.log("  ✓ Created friendship: alice ↔ bob");
  } else {
    console.log("  · Skipped (exists): alice ↔ bob friendship");
  }

  // ── Carol → Alice — pending request ──────────────────────────────────────────
  const existingCarol = await FriendRequest.findOne({
    senderId: ids.carol, receiverId: ids.alice,
  });

  if (!existingCarol) {
    await FriendRequest.create({
      senderId:   ids.carol,
      receiverId: ids.alice,
      status:     "PENDING",
    });
    console.log("  ✓ Created pending request: carol → alice");
  } else {
    console.log("  · Skipped (exists): carol → alice request");
  }

  // ── Dave → Alice — rejected request ──────────────────────────────────────────
  const existingDave = await FriendRequest.findOne({
    senderId: ids.dave, receiverId: ids.alice,
  });

  if (!existingDave) {
    await FriendRequest.create({
      senderId:    ids.dave,
      receiverId:  ids.alice,
      status:      "REJECTED",
      respondedAt: new Date(),
    });
    console.log("  ✓ Created rejected request: dave → alice");
  } else {
    console.log("  · Skipped (exists): dave → alice request");
  }

  console.log("\n✅ Seed complete.");
  console.log("   Users: alice, bob, carol, dave");
  console.log("   Password for all: password123\n");

  await disconnectDB();
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
