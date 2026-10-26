const { verifyToken } = require("../utils/jwt");
const { failure } = require("../utils/response");
const userRepository = require("../repositories/userRepository");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return failure(res, "Authentication required", 401);
    }

    const payload = verifyToken(token);
    const user = await userRepository.findById(payload.id);

    if (!user) {
      return failure(res, "User no longer exists", 401);
    }

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name, goal_id: user.goal_id };
    next();
  } catch (err) {
    return failure(res, "Invalid or expired token", 401);
  }
}

module.exports = authMiddleware;
