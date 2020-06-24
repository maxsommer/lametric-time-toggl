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
    const apiToken = req.get("api_token");
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

router.post(
  `/toggle`,
  requireApiToken(),
  wrapAsync(async (req, res) => {
    const apiToken = req.get("api_token");
    const current = await getCurrentEntry(apiToken);
    if (current.data === null) {
      await startEntry(apiToken);
      res.send({ meta: { message: `Started entry.` } });
      return;
    }

    await stopEntry(apiToken, current.data.id);
    res.send({ meta: { message: `Stopped entry.` } });
  })
);

module.exports = { router };
