/**
 * One-off: create a demo admin user. Run: npm run seed -w @growtix/api
 * Default: admin@growtix.local / adminadmin (change in production).
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "./lib/db.js";
import { Organization, User } from "./models/index.js";

async function main(): Promise<void> {
  await connectDb();
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@growtix.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "adminadmin12";
  const orgName = process.env.SEED_ORG_NAME ?? "Growtix Admin";

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      await User.findByIdAndUpdate(existing._id, {
        $set: { role: "admin", emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
      });
      console.log("Updated existing user to admin:", email);
    } else {
      console.log("Admin already exists:", email);
    }
    return;
  }

  const org = await Organization.create({ name: orgName, plan: "enterprise" });
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email,
    passwordHash,
    orgId: org._id,
    role: "admin",
    emailVerifiedAt: new Date(),
    tokenVersion: 0,
  });
  console.log("Created admin user:", email, "Password:", password);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
