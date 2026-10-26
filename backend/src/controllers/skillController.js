const skillService = require("../services/skillService");
const { success } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, await skillService.listSkillsForUser(req.user)); }
  catch (err) { next(err); }
}

async function listCatalog(req, res, next) {
  try { return success(res, { skills: await skillService.listSkills() }); }
  catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try { return success(res, { skill: await skillService.getSkillForUser(req.user, Number(req.params.id)) }); }
  catch (err) { next(err); }
}

async function create(req, res, next) {
  try { return success(res, { skill: await skillService.createSkill(req.body) }, 201); }
  catch (err) { next(err); }
}

async function update(req, res, next) {
  try { return success(res, { skill: await skillService.updateSkill(Number(req.params.id), req.body) }); }
  catch (err) { next(err); }
}

async function remove(req, res, next) {
  try { await skillService.deleteSkill(Number(req.params.id)); return success(res, {}); }
  catch (err) { next(err); }
}

module.exports = { list, listCatalog, getOne, create, update, remove };
