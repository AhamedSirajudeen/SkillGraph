const roadmapService = require("../services/roadmapService");
const { success } = require("../utils/response");

async function getRoadmap(req, res, next) {
  try { return success(res, await roadmapService.getRoadmapForUser(req.user.id)); }
  catch (err) { next(err); }
}

async function selectGoal(req, res, next) {
  try {
    const user = await roadmapService.selectGoalForUser(req.user.id, Number(req.body.goalId));
    return success(res, { user });
  } catch (err) { next(err); }
}

module.exports = { getRoadmap, selectGoal };
