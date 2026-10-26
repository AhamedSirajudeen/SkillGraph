const progressService = require("../services/progressService");
const { success } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, { progress: await progressService.listProgress(req.user.id) }); }
  catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const progress = await progressService.updateProgress(
      req.user.id,
      Number(req.params.skillId),
      req.body.status
    );
    return success(res, { progress });
  } catch (err) { next(err); }
}

module.exports = { list, update };
