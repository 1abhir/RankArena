const TYPE_LABELS = {
  hackathon_win: 'Hackathon Win',
  hackathon_participation: 'Hackathon',
  certification: 'Certification',
  internship: 'Internship',
  publication: 'Publication',
  award: 'Award',
  other: 'Other',
};

export default function AchievementCard({ achievement }) {
  return (
    <div className="rounded-lg border border-hair bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-bone">{achievement.title}</p>
        <span className="rounded-full bg-surface2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-signal">
          {TYPE_LABELS[achievement.type] || achievement.type}
        </span>
      </div>
      <p className="mt-1 text-xs text-ash">
        {achievement.issuer || 'Self-verified'} {achievement.achieved_on ? `- ${achievement.achieved_on}` : ''}
      </p>
    </div>
  );
}
