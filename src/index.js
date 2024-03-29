const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const expressRequestId = require("express-request-id");
const mainRouter = require("./controller/main.router");
const { AuthenticationError } = require("./module/error");
const morgan = require("morgan");

const app = new express();
const port = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(expressRequestId());
app.use(bodyParser());
app.use(compression());
app.use(morgan(":date[iso] :method :url :status :response-time ms"));
app.use(`/api/v1`, mainRouter.router);
app.use(`*`, (req, res) => {
  res.status(404).send();
});
app.use((error, req, res, next) => {
  if (error instanceof AuthenticationError) {
    console.error(
      `Toggl API responded with error 403 for request with id '${req.id}'.`
    );
    res.status(401).send({
      meta: {
        message: `Query Parameter 'api_token' must contain valid toggl.com API token.`,
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
