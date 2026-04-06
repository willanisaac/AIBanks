import { motion } from 'framer-motion';
import { ArrowSquareOut, SoccerBall, MapPin, Clock, Trophy } from '@phosphor-icons/react';
import { useFifaData, useCountdown } from '../../hooks/useFifaData';
import { TOURNAMENT_INFO, FIFA_LINKS } from '../../data/fifaData';
import styles from './FifaLive.module.css';

// ─── Animation variants ────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Helpers ────────────────────────────────────────────────────
function formatMatchDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
function formatMatchTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}
function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  return `hace ${Math.floor(s / 3600)}h`;
}

// ─── Countdown Sub-component ────────────────────────────────────
function Countdown() {
  const { days, hours, minutes, seconds, isPast } = useCountdown(TOURNAMENT_INFO.startDate);

  return (
    <motion.div className={styles.countdown} variants={fadeUp}>
      <div className={styles.countdownLabel}>⚽ FIFA World Cup 2026™</div>
      <div className={styles.countdownTitle}>
        {isPast
          ? '¡El Mundial ha comenzado!'
          : `Faltan para ${TOURNAMENT_INFO.openingMatch.match}`}
      </div>
      {isPast ? (
        <div className={styles.countdownStarted}>🏟️ EN VIVO AHORA</div>
      ) : (
        <div className={styles.countdownGrid}>
          <div className={styles.countdownUnit}>
            <motion.span
              className={styles.countdownNum}
              key={days}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {String(days).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Días</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span
              className={styles.countdownNum}
              key={hours}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {String(hours).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Horas</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span
              className={styles.countdownNum}
              key={minutes}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {String(minutes).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Min</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <motion.span
              className={styles.countdownNum}
              key={seconds}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {String(seconds).padStart(2, '0')}
            </motion.span>
            <span className={styles.countdownUnitLabel}>Seg</span>
          </div>
        </div>
      )}
      <div className={styles.countdownVenue}>
        <MapPin size={12} weight="bold" />
        <span>
          {TOURNAMENT_INFO.openingMatch.venue} · {TOURNAMENT_INFO.openingMatch.city}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Ecuador Group Card ─────────────────────────────────────────
function EcuadorGroup({ groups, getTeam }) {
  const group = groups.E;
  const teams = group.teams.map((code) => getTeam(code));

  return (
    <motion.div className={styles.groupCard} variants={fadeUp}>
      <div className={styles.groupHeader}>
        <div className={styles.groupBadge}>
          <SoccerBall size={14} weight="bold" color="var(--gold-primary)" />
          <span className={styles.groupLetter}>GRUPO E</span>
        </div>
        <span className={styles.ecuadorTag}>🇪🇨 ECUADOR</span>
      </div>
      <motion.div className={styles.groupTeams} variants={stagger} initial="hidden" animate="show">
        {teams.map((team) => (
          <motion.div
            key={team.code}
            className={`${styles.groupTeam} ${team.code === 'ECU' ? styles.isEcuador : ''}`}
            variants={fadeUp}
            whileTap={{ scale: 0.98 }}
          >
            <span className={styles.teamFlag}>{team.flag}</span>
            <div className={styles.teamInfo}>
              <div className={styles.teamName}>{team.name}</div>
              <div className={styles.teamConf}>{team.conf}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Ecuador Schedule ───────────────────────────────────────────
function EcuadorSchedule({ schedule, getTeam }) {
  return (
    <motion.div variants={fadeUp}>
      <div className={styles.scheduleTitle}>
        <Clock size={16} weight="bold" color="var(--gold-primary)" />
        <span>Calendario Ecuador 🇪🇨</span>
      </div>
      <motion.div className={styles.matchList} variants={stagger} initial="hidden" animate="show">
        {schedule.map((match) => {
          const home = getTeam(match.home);
          const away = getTeam(match.away);
          return (
            <motion.a
              key={match.id}
              className={styles.matchItem}
              href={match.fifaUrl}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUp}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.matchMeta}>
                <span className={styles.matchDate}>
                  {formatMatchDate(match.date)} · {formatMatchTime(match.date)}
                </span>
                <span className={styles.matchday}>Jornada {match.matchday}</span>
              </div>
              <div className={styles.matchTeams}>
                <div className={styles.matchTeam}>
                  <span className={styles.matchTeamFlag}>{home.flag}</span>
                  <span className={styles.matchTeamName}>{home.name}</span>
                </div>
                <span className={styles.matchVs}>VS</span>
                <div className={styles.matchTeam}>
                  <span className={styles.matchTeamFlag}>{away.flag}</span>
                  <span className={styles.matchTeamName}>{away.name}</span>
                </div>
              </div>
              <div className={styles.matchVenue}>
                <MapPin size={11} weight="bold" />
                <span>
                  {match.venue} · {match.city}
                </span>
              </div>
            </motion.a>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ─── CONMEBOL Standings ─────────────────────────────────────────
function ConmebolStandings({ standings, getTeam }) {
  const top7 = standings.slice(0, 7);

  return (
    <motion.div className={styles.standingsCard} variants={fadeUp}>
      <div className={styles.standingsHeader}>
        <div className={styles.standingsTitle}>
          <Trophy size={14} weight="bold" style={{ marginRight: 6, verticalAlign: 'middle' }} />
          CONMEBOL Clasificatorias
        </div>
        <span className={styles.standingsBadge}>FINAL</span>
      </div>
      <table className={styles.standingsTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Selección</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {top7.map((row) => {
            const team = getTeam(row.code);
            const rowClass =
              row.status === 'qualified'
                ? styles.rowQualified
                : row.status === 'playoff'
                ? styles.rowPlayoff
                : styles.rowEliminated;
            return (
              <motion.tr
                key={row.code}
                className={`${rowClass} ${row.code === 'ECU' ? styles.rowEcuador : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: row.pos * 0.04 }}
              >
                <td>
                  <span
                    className={styles.statusDot}
                    style={{
                      background:
                        row.status === 'qualified'
                          ? 'var(--accent-green)'
                          : row.status === 'playoff'
                          ? 'var(--gold-primary)'
                          : 'transparent',
                    }}
                  />
                  {row.pos}
                </td>
                <td>
                  <div className={styles.standingsTeamCell}>
                    <span className={styles.standingsFlag}>{team.flag}</span>
                    <span className={styles.standingsTeamName}>{team.name}</span>
                  </div>
                </td>
                <td>{row.pj}</td>
                <td>{row.pg}</td>
                <td>{row.pe}</td>
                <td>{row.pp}</td>
                <td>{row.dg}</td>
                <td className={styles.standingsPts}>{row.pts}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.sourceInfo}>
        <span>Fuente:</span>
        <a
          href={FIFA_LINKS.conmebol}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          FIFA.com
        </a>
        <span>· Final marzo 2026</span>
      </div>
    </motion.div>
  );
}

// ─── Featured Matches ───────────────────────────────────────────
function FeaturedMatches({ matches, getTeam }) {
  return (
    <motion.div variants={fadeUp}>
      <div className={styles.scheduleTitle}>
        <span>🔥</span>
        <span>Partidos Destacados</span>
      </div>
      <div className={styles.featuredScroll}>
        {matches.map((match, i) => {
          const home = getTeam(match.home);
          const away = getTeam(match.away);
          return (
            <motion.div
              key={match.id}
              className={styles.featuredCard}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -3 }}
            >
              {match.tag && (
                <div className={styles.featuredTag}>
                  <span>⚡</span>
                  <span>{match.tag}</span>
                </div>
              )}
              <div className={styles.featuredTeams}>
                <span className={styles.featuredFlag}>{home.flag}</span>
                <span className={styles.featuredVs}>VS</span>
                <span className={styles.featuredFlag}>{away.flag}</span>
              </div>
              <div className={styles.featuredDate}>{formatMatchDate(match.date)}</div>
              <div className={styles.featuredVenue}>
                📍 {match.venue}, {match.city}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export default function FifaLive() {
  const {
    ecuadorSchedule,
    featuredMatches,
    conmebolStandings,
    groups,
    source,
    lastUpdated,
    isLoading,
    getTeam: getTeamFn,
  } = useFifaData();

  return (
    <motion.section
      className={styles.fifaSection}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
    >
      {/* Header */}
      <div className={styles.sectionHead}>
        <div className={styles.headLeft}>
          <h3 className={styles.fifaTitle}>FIFA World Cup 2026</h3>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span>{source === 'live' ? 'LIVE' : 'FIFA'}</span>
          </div>
        </div>
        <span className={styles.updatedAt}>
          {isLoading ? '⟳ Actualizando...' : timeAgo(lastUpdated)}
        </span>
      </div>

      {/* Countdown */}
      <Countdown />

      {/* Ecuador Group */}
      <EcuadorGroup groups={groups} getTeam={getTeamFn} />

      {/* Ecuador Schedule */}
      <EcuadorSchedule schedule={ecuadorSchedule} getTeam={getTeamFn} />

      {/* Featured Matches */}
      <FeaturedMatches matches={featuredMatches} getTeam={getTeamFn} />

      <div className={styles.divider} />

      {/* CONMEBOL Standings */}
      <ConmebolStandings standings={conmebolStandings} getTeam={getTeamFn} />

      {/* FIFA Link */}
      <motion.a
        href={FIFA_LINKS.matchCentre}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fifaLink}
        variants={fadeUp}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
      >
        <SoccerBall size={18} weight="bold" />
        <span>Abrir FIFA Match Centre</span>
        <ArrowSquareOut size={14} weight="bold" />
      </motion.a>

      <div className={styles.sourceInfo} style={{ marginTop: 12, marginBottom: 4 }}>
        <span>Datos de</span>
        <a
          href="https://www.fifa.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sourceLink}
        >
          FIFA.com
        </a>
        <span>· Actualización cada 60s</span>
      </div>
    </motion.section>
  );
}
