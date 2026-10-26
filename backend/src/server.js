require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillGraph API listening on port ${PORT}`);
});

module.exports = app;
