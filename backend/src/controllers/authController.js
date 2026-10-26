const authService = require("../services/authService");
const userRepository = require("../repositories/userRepository");
const { success } = require("../utils/response");

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    return success(res, { user, token }, 201);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    return success(res, { user, token });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await userRepository.findById(req.user.id);
    return success(res, { user });
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body);
    return success(res, result);
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    return success(res, { message: "Password reset successfully" });
  } catch (err) { next(err); }
}

module.exports = { register, login, me, forgotPassword, resetPassword };
