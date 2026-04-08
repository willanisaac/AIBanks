import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TOURNAMENT_INFO,
  WC2026_GROUPS,
  ECUADOR_SCHEDULE,
  FEATURED_MATCHES,
  CONMEBOL_STANDINGS,
  ALL_TEAMS,
  CONMEBOL_EXTRA_TEAMS,
  getTeam,
} from '../data/fifaData';

const REFRESH_INTERVAL = 60_000; // 60 seconds
const API_BASE = '/api/thesportsdb';
const WC_LEAGUE_ID = 4429;

/**
 * Attempts to fetch live data from TheSportsDB (proxied via Vite).
 * Falls back to curated static data if the request fails.
 */
async function fetchLiveData() {
  try {
    const res = await fetch(
      `${API_BASE}/eventsseason.php?id=${WC_LEAGUE_ID}&s=2026`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.events && json.events.length > 0) {
      // Transform TheSportsDB events into our format
      const events = json.events.map((e) => ({
        id: e.idEvent,
        date: e.strTimestamp || e.dateEvent,
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        homeScore: e.intHomeScore,
        awayScore: e.intAwayScore,
        venue: e.strVenue,
        city: e.strCity,
        status: e.strStatus,
        group: e.intRound ? `Jornada ${e.intRound}` : '',
        thumb: e.strThumb,
      }));
      return { events, source: 'live' };
    }
    // API returned but no events — WC hasn't started yet
    return null;
  } catch {
    // Network error, timeout, CORS, etc — expected in many scenarios
    return null;
  }
}

/**
 * Custom hook for FIFA data with live polling.
 */
export function useFifaData() {
  const [state, setState] = useState({
    ecuadorSchedule: ECUADOR_SCHEDULE,
    featuredMatches: FEATURED_MATCHES,
    conmebolStandings: CONMEBOL_STANDINGS,
    groups: WC2026_GROUPS,
    tournament: TOURNAMENT_INFO,
    liveEvents: null,
    source: 'static', // 'static' | 'live'
    lastUpdated: new Date(),
    isLoading: true,
    error: null,
  });

  const intervalRef = useRef(null);

  const refresh = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setState((s) => ({ ...s, isLoading: true }));
    }
    const result = await fetchLiveData();

    setState((s) => ({
      ...s,
      isLoading: false,
      lastUpdated: new Date(),
      ...(result
        ? { liveEvents: result.events, source: 'live' }
        : { source: 'static' }),
    }));
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    refresh({ showLoading: false });
    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  return { ...state, refresh, getTeam };
}

/**
 * Countdown hook — updates every second.
 */
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(tick);
  }, [targetDate]);

  return timeLeft;
}

function calcTimeLeft(target) {
  const now = Date.now();
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: diff <= 0,
  };
}
