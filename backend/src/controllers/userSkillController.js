const userSkillService = require("../services/userSkillService");
const { success } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, { skills: await userSkillService.listKnownSkills(req.user.id) }); }
  catch (err) { next(err); }
}

async function add(req, res, next) {
  try {
    const skills = await userSkillService.addKnownSkills(req.user.id, req.body.skillIds);
    return success(res, { skills }, 201);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await userSkillService.removeKnownSkill(req.user.id, Number(req.params.skillId));
    return success(res, {});
  } catch (err) { next(err); }
}

module.exports = { list, add, remove };
