const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const expressRequestId = require("express-request-id");
const morgan = require("morgan");

const package = require("../package.json");
const app = new express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(expressRequestId());
app.use(bodyParser());
app.use(compression());
app.use(morgan(":date[iso] :method :url :status :response-time ms"));
app.get("/", (req, res) => {
  console.dir({ id: req.id });
  res.status(200).send({
    meta: {
      name: package.name,
      version: package.version,
      repository: package.repository,
    },
  });
});
app.listen(port, () => {
  console.info(`lametric-time-toggle: api started on port ${port}`);
});
