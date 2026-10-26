const goalService = require("../services/goalService");
const { success } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, { goals: await goalService.listGoals() }); }
  catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try { return success(res, { goal: await goalService.getGoal(Number(req.params.id)) }); }
  catch (err) { next(err); }
}

async function create(req, res, next) {
  try { return success(res, { goal: await goalService.createGoal(req.body) }, 201); }
  catch (err) { next(err); }
}

async function update(req, res, next) {
  try { return success(res, { goal: await goalService.updateGoal(Number(req.params.id), req.body) }); }
  catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await goalService.deleteGoal(Number(req.params.id)); return success(res, {}); }
  catch (err) { next(err); }
}

async function addSkill(req, res, next) {
  try {
    await goalService.addSkillToGoal(Number(req.params.goalId), Number(req.body.skillId));
    return success(res, {}, 201);
  } catch (err) { next(err); }
}

async function removeSkill(req, res, next) {
  try {
    await goalService.removeSkillFromGoal(Number(req.params.goalId), Number(req.params.skillId));
    return success(res, {});
  } catch (err) { next(err); }
}

module.exports = { list, getOne, create, update, remove, addSkill, removeSkill };
