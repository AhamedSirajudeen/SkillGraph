const bcrypt = require("bcrypt");
const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const { signToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;
const resetRequests = new Map();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function register({ name, email, password }) {
  if (!name || !name.trim()) throw httpError("Name is required", 400);
  if (!isValidEmail(email)) throw httpError("A valid email is required", 400);
  if (!password || password.length < 8) throw httpError("Password must be at least 8 characters", 400);

  const existing = await userRepository.findByEmail(email.toLowerCase());
  if (existing) throw httpError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    role: "learner",
  });

  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
}

async function login({ email, password }) {
  if (!email || !password) throw httpError("Email and password are required", 400);

  const user = await userRepository.findByEmail(email.toLowerCase());
  if (!user) throw httpError("Invalid email or password", 401);

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) throw httpError("Invalid email or password", 401);

  const token = signToken({ id: user.id, role: user.role });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
}

async function requestPasswordReset({ email }) {
  if (!isValidEmail(email)) throw httpError("Enter a valid email address", 400);
  const normalizedEmail = email.toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw httpError("No account was found for this email address. Please check your email or register for a new account.", 404);
  }

  const previousRequest = resetRequests.get(normalizedEmail);
  if (previousRequest && Date.now() - previousRequest < RESET_REQUEST_COOLDOWN_MS) {
    throw httpError("Please wait a minute before requesting another password reset.", 429);
  }

  // This project has no SMTP/email provider. In production, do not create a
  // token that cannot be delivered. Development receives a local-only link.
  if (process.env.NODE_ENV === "production") {
    throw httpError("Password reset email delivery is not configured. Please contact support.", 503);
  }

  const token = crypto.randomBytes(32).toString("hex");
  await userRepository.savePasswordResetToken(user.id, hashResetToken(token));
  resetRequests.set(normalizedEmail, Date.now());

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return {
    development: true,
    resetUrl: `${frontendUrl}/reset-password?token=${token}`,
  };
}

async function resetPassword({ token, password, confirmPassword }) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    throw httpError("This password reset link is invalid or has expired", 400);
  }
  if (!password || password.length < 8) throw httpError("Password must be at least 8 characters", 400);
  if (password !== confirmPassword) throw httpError("Passwords do not match", 400);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const updated = await userRepository.resetPassword(hashResetToken(token), passwordHash);
  if (!updated) throw httpError("This password reset link is invalid or has expired", 400);
}

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { register, login, requestPasswordReset, resetPassword };
