# lametric-time-toggl

Small node backend to handle LaMetric Time triggered requests to toggl.com

## Getting started

1. Go to ['Profile Settings' on toggl.com](https://toggl.com/app/profile)
2. Find your 'API Token' on that page and copy it
3. Open up the smartphone LaMetric Time app and search for 'toggl.com (unofficial)'
4. Install the app.
5. Select the app and enter your API Token there to get started tracking your time.

## Environments

The only production environment is running at Heroku at `https://lametric-time-toggl.herokuapp.com/api/v1`.

## REST API

### API information

Delivers information about the API status and version.  
Request:

```curl
curl https://lametric-time-toggl.herokuapp.com/api/v1
```

Response:

```json
{
  "meta": {
    "name": "lametric-time-toggl",
    "version": "1.0.0",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/maxsommer/lametric-time-toggl.git"
    }
  }
}
```

### Get display for current timer

If no timer is running the 'stop' icon with text '--:--' will be displayed.  
Otherwise icon 'play' with the text of hours and minutes of current timer will be displayed (e.g. '02:15').

```curl
curl https://lametric-time-toggl.herokuapp.com/api/v1/current?api_token=XXX_YOUR_TOKEN_XXX
```

Running timer response:

```json
{
  "frames": [
    {
      "text": "02:13",
      "icon": "38671"
    }
  ]
}
```

Stopped timer response:

```json
{
  "frames": [
    {
      "text": "--:--",
      "icon": "38674"
    }
  ]
}
```

### Toggle timer

If no timer for current user is active will start a new one. Otherwise will stop the running timer.  
Request:

```curl
curl https://lametric-time-toggl.herokuapp.com/api/v1/toggle?api_token=XXX_YOUR_TOKEN_XXX
```

Response for started entry:

```json
{
  "meta": {
    "message": "Started entry."
  }
}
```

Response for stopped entry:

```json
{
  "meta": {
    "message": "Stopped entry."
  }
}
```
