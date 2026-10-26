const graphService = require("../services/graphService");
const { success } = require("../utils/response");

async function getGraph(req, res, next) {
  try {
    const data = await graphService.getGraph(req.user ? req.user.id : null);
    return success(res, data);
  } catch (err) { next(err); }
}

module.exports = { getGraph };
