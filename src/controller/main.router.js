const package = require("../../package.json");
const {
  getMe,
  getCurrentEntry,
  startEntry,
  stopEntry,
} = require("../module/toggl");
const router = require("express").Router();
const { wrapAsync } = require("@rimiti/express-async");
const { AuthenticationError } = require("../module/error");

function requireApiToken() {
  return (req, res, next) => {
    const apiToken = req.query.api_token;
    if (!apiToken || apiToken.length === 0) {
      throw new AuthenticationError();
    }
    next();
  };
}

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.status(200).send({
      meta: {
        name: package.name,
        version: package.version,
        repository: package.repository,
      },
    });
  })
);

router.get(
  `/toggle`,
  requireApiToken(),
  wrapAsync(async (req, res) => {
    const apiToken = req.query.api_token;
    const current = await getCurrentEntry(apiToken);
    console.info({
      requestId: req.id,
      message: `Toggling timer for ${apiToken}`,
    });
    if (current.data === null) {
      const newEntry = await startEntry(apiToken);
      console.info({
        requestId: req.id,
        message: `Started entry with id ${newEntry.data.id}`,
      });
      res.send({ meta: { message: `Started entry.` } });
      return;
    }

    const stoppedEntry = await stopEntry(apiToken, current.data.id);
    console.info({
      requestId: req.id,
      message: `Stopped entry with id ${stoppedEntry.data.id}`,
    });
    res.send({ meta: { message: `Stopped entry.` } });
  })
);

module.exports = { router };
