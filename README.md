# Premier League Fixture Board

An interactive, minimalist fixture board for the English Premier League. Hover over any team to see their match breakdowns — wins, losses, draws, and remaining fixtures — all in one view.

## Features

- **20 teams** listed by league position with crests
- **Hover to reveal** match results grouped by Won, Lost, Drawn, Remaining
- **Live stats** — points, games played, GF, GA, GD
- **Auto-refresh** — polls every 60 seconds for live score updates
- **Dark minimalist UI** built with vanilla HTML/CSS/JS

## Setup

### Local Development

1. Clone the repo
2. Add your [football-data.org](https://www.football-data.org/) API key to `server.js`
3. Run the local server:
   ```bash
   node server.js
   ```
4. Open `http://localhost:3000`

### Vercel Deployment

1. Import the repo on [vercel.com](https://vercel.com)
2. Add the environment variable `FOOTBALL_API_KEY` with your API key
3. Deploy

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- [football-data.org](https://www.football-data.org/) API (free tier)
- Vercel serverless functions (API proxy)

## API

The app uses a single serverless function (`api/football.js`) to proxy requests to football-data.org, keeping the API key server-side.
