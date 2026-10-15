const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-z0-9_.]+$/,
        "Username may only contain lowercase letters, numbers, underscores, and periods.",
      ],
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    resetCode: {
      type: String,
      select: false,
    },
    resetCodeExpires: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["reader", "editor", "admin"],
      default: "reader",
    },
    accountType: {
      type: String,
      enum: ["reader", "journalist", "editor", "official_brand"],
      default: "reader",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    preferences: {
      theme: { type: String, default: "morning" },
      typeScale: { type: String, default: "standard" },
      favoriteDesks: { type: [String], default: ["ai", "web", "startups"] },
      notifications: { type: Boolean, default: true },
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    organization: {
      type: String,
      default: "",
    },
    desk: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: null,
    },
    verification: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
        index: true,
      },
      category: {
        type: String,
        enum: ["journalist", "editor", "publication", "none"],
        default: "none",
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      badge: {
        type: String,
        default: null,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    subscription: {
      plan: {
        type: String,
        default: "Annual Broadsheet",
      },
      status: {
        type: String,
        enum: ["active", "trial", "cancelled", "expired"],
        default: "active",
      },
      renewsAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const RESERVED_USERNAMES = new Set([
  "thedigitaltimes",
  "digitaltimes",
  "admin",
  "administrator",
  "root",
  "support",
  "system",
  "official",
  "editor",
  "press",
  "mod",
  "moderator",
  "staff",
]);

UserSchema.statics.isUsernameReserved = function (username) {
  if (!username) return false;
  return RESERVED_USERNAMES.has(String(username).trim().toLowerCase());
};

UserSchema.statics.generateUniqueUsername = async function (baseCandidate) {
  const clean = String(baseCandidate || "reader")
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 20);

  let candidate = clean.length >= 3 ? clean : `reader_${Math.floor(1000 + Math.random() * 9000)}`;

  if (RESERVED_USERNAMES.has(candidate)) {
    candidate = `reader_${candidate}`;
  }

  let unique = candidate;
  let counter = 1;
  while (await this.findOne({ username: unique })) {
    unique = `${candidate.slice(0, 18)}_${counter}`;
    counter++;
  }
  return unique;
};

module.exports = mongoose.model("User", UserSchema);

