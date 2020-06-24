const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const expressRequestId = require("express-request-id");
const mainRouter = require("./controller/main.router");
const { AuthenticationError } = require("./module/error");

const app = new express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(expressRequestId());
app.use(bodyParser());
app.use(compression());
app.use(`/api/v1`, mainRouter.router);
app.use(`*`, (req, res) => {
  res.status(404).send();
});
app.use((error, req, res, next) => {
  if (error instanceof AuthenticationError) {
    res.status(401).send({
      meta: {
        message: `Header 'api_token' did not contain a valid toggl.com API token.`,
      },
    });
    return;
  }
  res.status(500).send({ meta: { message: `Unexpected error occured.` } });
  console.error(error);
});

app.listen(port, () => {
  console.info(`lametric-time-toggle: api started on port ${port}`);
});
