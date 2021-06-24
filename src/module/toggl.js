const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const http = rateLimit(axios, { maxRequests: 1, perMilliseconds: 1000 });
const { AuthenticationError } = require("./error");
const created_with = `lametric-time-toggl`;

async function getMe(apiToken) {
  return await togglRequest("GET", "/me", apiToken);
}

async function getCurrentEntry(apiToken) {
  return await togglRequest("GET", "/time_entries/current", apiToken);
}

async function startEntry(apiToken) {
  return await togglRequest("POST", "/time_entries/start", apiToken, {
    time_entry: { created_with },
  });
}

async function stopEntry(apiToken, id) {
  return await togglRequest("PUT", `/time_entries/${id}/stop`, apiToken);
}

async function togglRequest(method, endpoint, apiToken, data) {
  let response;
  try {
    response = await http({
      method,
      url: `https://api.track.toggl.com/api/v8${endpoint}`,
      auth: {
        username: apiToken,
        password: `api_token`,
      },
      data,
    });
  } catch (error) {
    console.error(error);
    if (error.response.status === 403) {
      throw new AuthenticationError();
    }
    throw error;
  }

  return response.data;
}
module.exports = { getMe, getCurrentEntry, startEntry, stopEntry };
