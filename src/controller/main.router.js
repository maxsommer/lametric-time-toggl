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
const { DateTime } = require("luxon");
const { handleGetPrivacy } = require("./privacy.controller");

const ICONS = {
  PLAY_ICON: "38671",
  STOP_ICON: "38674",
};

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

router.get(
  `/current`,
  requireApiToken(),
  wrapAsync(async (req, res) => {
    const apiToken = req.query.api_token;
    const getCurrentResponse = await getCurrentEntry(apiToken);
    const current = getCurrentResponse.data;
    let frames = [];

    // No current timer running, display frame with 'stop' icon and ––:–– as text
    if (current === null) {
      frames = [
        {
          text: "--:--",
          icon: ICONS.STOP_ICON,
        },
      ];
    }

    // Display current timers running time
    if (current !== null) {
      const startedAt = DateTime.fromISO(current.start);
      const now = DateTime.local();
      const delta = now.diff(startedAt, ["hours", "minutes"]);
      const text = getTimerString(delta.hours, delta.minutes);
      frames = [
        {
          text,
          icon: ICONS.PLAY_ICON,
        },
      ];
    }

    res.send({ frames });
  })
);

function getTimerString(hours, minutes) {
  let hoursString = "";
  if (hours < 10) {
    hoursString = `0${hours}`;
  } else {
    hoursString = hours;
  }

  let minutesString = "";
  minutes = Number(minutes.toFixed(0));
  if (minutes < 10) {
    minutesString = `0${minutes}`;
  } else {
    minutesString = minutes;
  }

  return `${hoursString}:${minutesString}`;
}

router.get("/privacy", handleGetPrivacy);

module.exports = { router };
