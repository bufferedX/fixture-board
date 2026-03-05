# Premier League Fixture Board

An interactive, minimalist fixture board for the English Premier League. Hover over any team to see their match breakdowns — wins, losses, draws, and remaining fixtures — all in one view.

## Features

- **20 teams** listed by league position with crests
- **Hover to reveal** match results grouped by Won, Lost, Drawn, Remaining
- **Live stats** — points, games played, GF, GA, GD
- **Auto-refresh** — polls every 60 seconds for live score updates

## API

The app uses a single serverless function (`api/football.js`) to proxy requests to football-data.org, keeping the API key server-side.
