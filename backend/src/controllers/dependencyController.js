const dependencyService = require("../services/dependencyService");
const { success } = require("../utils/response");

async function list(req, res, next) {
  try { return success(res, { dependencies: await dependencyService.listDependencies() }); }
  catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const dependency = await dependencyService.createDependency(
      Number(req.body.prerequisiteSkillId),
      Number(req.body.dependentSkillId)
    );
    return success(res, { dependency }, 201);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await dependencyService.deleteDependency(Number(req.params.id));
    return success(res, {});
  } catch (err) { next(err); }
}

module.exports = { list, create, remove };
