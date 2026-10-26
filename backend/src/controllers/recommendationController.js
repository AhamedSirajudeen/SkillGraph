const roadmapService = require("../services/roadmapService");
const { success } = require("../utils/response");

async function getRecommendation(req, res, next) {
  try { return success(res, await roadmapService.getRecommendation(req.user.id)); }
  catch (err) { next(err); }
}

module.exports = { getRecommendation };
