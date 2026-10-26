const userRepository = require("../repositories/userRepository");
const { success } = require("../utils/response");

async function updateProfile(req, res, next) {
  try {
    const user = await userRepository.updateProfile(req.user.id, { name: req.body.name });
    return success(res, { user });
  } catch (err) { next(err); }
}

module.exports = { updateProfile };
