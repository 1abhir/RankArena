import { Link } from 'react-router-dom';
import { getTier } from './tier';

export default function RankBar({ entry }) {
  const tier = getTier(entry.total_score);
  const initials = entry.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Link
      to={`/profile/${entry.id}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-lg border border-hair bg-surface px-4 py-3 transition-all hover:border-signal/40 hover:bg-surface2"
    >
      <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: tier.color }} />

      <span className="w-8 shrink-0 text-center font-mono-num text-sm text-ash">
        {String(entry.rank).padStart(2, '0')}
      </span>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 font-display text-xs font-bold text-bone">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold text-bone">{entry.name}</p>
        <p className="truncate text-xs text-ash">
          {entry.track_name || 'Unassigned track'} - {entry.role === 'professional' ? 'Professional' : 'Student'}
          {entry.active_days_7d ? ` - ${entry.active_days_7d} active days` : ''}
        </p>
      </div>

      <span
        className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-block"
        style={{ color: tier.color, backgroundColor: `${tier.color}1A` }}
      >
        {tier.name}
      </span>

      <span className="font-mono-num text-lg font-bold text-bone score-reveal">
        {Math.round(entry.total_score)}
      </span>
    </Link>
  );
}
