export default async function handler(req, res) {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const apiUrl = `https://api.football-data.org/v4/${path}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY }
    });

    const data = await response.text();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(response.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch from football-data.org' });
  }
}
