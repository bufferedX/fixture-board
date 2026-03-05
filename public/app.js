const BASE_URL = '/api/v4';
const COMPETITION = 'PL';

// State
let teams = [];
let matches = [];
let standings = [];
let activeTeamId = null;

// Fetch helpers
async function apiFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    const body = await res.text();
    console.error(`API error ${res.status}:`, body);
    throw new Error(`API error: ${res.status} - ${body}`);
  }
  return res.json();
}

async function loadData() {
  const [matchData, standingsData] = await Promise.all([
    apiFetch(`/competitions/${COMPETITION}/matches`),
    apiFetch(`/competitions/${COMPETITION}/standings`)
  ]);

  matches = matchData.matches;
  standings = standingsData.standings[0].table;

  // Build team list sorted by standings position
  teams = standings.map(entry => ({
    id: entry.team.id,
    name: entry.team.shortName || entry.team.name,
    crest: entry.team.crest,
    position: entry.position,
    played: entry.playedGames,
    won: entry.won,
    drawn: entry.draw,
    lost: entry.lost,
    points: entry.points,
    goalsFor: entry.goalsFor,
    goalsAgainst: entry.goalsAgainst,
    goalDifference: entry.goalDifference
  }));

  // Set season label
  const season = matchData.competition?.season;
  if (season) {
    document.getElementById('seasonLabel').textContent =
      `${season.startDate.slice(0, 4)}/${season.endDate.slice(0, 4)} Season`;
  }
}

// Categorize matches for a given team
function getTeamBreakdown(teamId) {
  const won = [];
  const lost = [];
  const drawn = [];
  const remaining = [];

  for (const match of matches) {
    const isHome = match.homeTeam.id === teamId;
    const isAway = match.awayTeam.id === teamId;
    if (!isHome && !isAway) continue;

    const opponent = isHome ? match.awayTeam : match.homeTeam;
    const venue = isHome ? 'H' : 'A';
    const score = match.score?.fullTime;

    const entry = {
      opponent,
      venue,
      date: match.utcDate,
      matchday: match.matchday,
      status: match.status
    };

    if (match.status === 'FINISHED' && score) {
      const teamGoals = isHome ? score.home : score.away;
      const opponentGoals = isHome ? score.away : score.home;
      entry.teamGoals = teamGoals;
      entry.opponentGoals = opponentGoals;
      entry.scoreDisplay = isHome
        ? `${score.home}-${score.away}`
        : `${score.away}-${score.home}`;

      if (teamGoals > opponentGoals) won.push(entry);
      else if (teamGoals < opponentGoals) lost.push(entry);
      else drawn.push(entry);
    } else {
      remaining.push(entry);
    }
  }

  // Sort finished by matchday, remaining by date
  const byMatchday = (a, b) => a.matchday - b.matchday;
  won.sort(byMatchday);
  lost.sort(byMatchday);
  drawn.sort(byMatchday);
  remaining.sort((a, b) => new Date(a.date) - new Date(b.date));

  return { won, lost, drawn, remaining };
}

// Render
function renderTeamList() {
  const container = document.getElementById('teamList');
  container.innerHTML = teams.map(team => `
    <div class="team-item" data-id="${team.id}">
      <span class="team-position">${team.position}</span>
      <img class="team-crest" src="${team.crest}" alt="" loading="lazy">
      <span class="team-name">${team.name}</span>
    </div>
  `).join('');

  // Event listeners
  container.querySelectorAll('.team-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const id = parseInt(el.dataset.id);
      setActiveTeam(id);
    });
  });
}

function setActiveTeam(teamId) {
  if (activeTeamId === teamId) return;
  activeTeamId = teamId;

  // Update active class
  document.querySelectorAll('.team-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.id) === teamId);
  });

  renderDetailPanel(teamId);
}

function renderDetailPanel(teamId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  const breakdown = getTeamBreakdown(teamId);
  const panel = document.getElementById('detailPanel');

  panel.innerHTML = `
    <div class="detail-header">
      <img class="team-crest" src="${team.crest}" alt="">
      <span class="team-name">${team.name}</span>
      <div class="team-stats">
        <span class="stat-primary">${team.points} pts</span>
        <span class="stat-divider">&middot;</span>
        <span class="stat-primary">${team.played} played</span>
        <span class="stat-divider">&middot;</span>
        <span class="stat-secondary">GF ${team.goalsFor}</span>
        <span class="stat-secondary">GA ${team.goalsAgainst}</span>
        <span class="stat-secondary">GD ${team.goalDifference > 0 ? '+' : ''}${team.goalDifference}</span>
      </div>
    </div>
    <div class="categories">
      ${renderCategory('Won', 'won', breakdown.won)}
      ${renderCategory('Lost', 'lost', breakdown.lost)}
      ${renderCategory('Drawn', 'drawn', breakdown.drawn)}
      ${renderCategory('Remaining', 'remaining', breakdown.remaining)}
    </div>
  `;
}

function renderCategory(label, className, entries) {
  const matchesHtml = entries.length === 0
    ? '<div class="empty-category">None</div>'
    : entries.map(e => `
      <div class="match-entry">
        <img class="opponent-crest" src="${e.opponent.crest}" alt="" loading="lazy">
        <span class="opponent-name">${e.opponent.shortName || e.opponent.name}</span>
        ${e.scoreDisplay
          ? `<span class="match-score">${e.scoreDisplay}</span>`
          : `<span class="match-date">${formatDate(e.date)}</span>`
        }
        <span class="match-venue">${e.venue}</span>
      </div>
    `).join('');

  return `
    <div class="category ${className}">
      <div class="category-header">
        <span class="category-label">${label}</span>
        <span class="category-count">${entries.length}</span>
      </div>
      <div class="match-list">
        ${matchesHtml}
      </div>
    </div>
  `;
}

function formatDate(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Init
async function init() {
  const overlay = document.getElementById('loadingOverlay');
  try {
    await loadData();
    renderTeamList();

    // Auto-select first team
    if (teams.length > 0) {
      setActiveTeam(teams[0].id);
    }
  } catch (err) {
    console.error('Failed to load data:', err);
    overlay.querySelector('p').textContent = 'Failed to load data. Check your API key.';
    return;
  }

  overlay.classList.add('hidden');

  // Poll every 60s for live updates
  setInterval(async () => {
    try {
      await loadData();
      renderTeamList();
      if (activeTeamId) {
        renderDetailPanel(activeTeamId);
      }
    } catch (err) {
      console.warn('Polling update failed:', err);
    }
  }, 60000);
}

init();
