export default function TrackTabs({ tracks, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('')}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          active === '' ? 'bg-signal text-ink' : 'border border-hair text-ash hover:text-bone'
        }`}
      >
        All tracks
      </button>
      {tracks.map((t) => (
        <button
          key={t.slug}
          onClick={() => onChange(t.slug)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            active === t.slug ? 'bg-signal text-ink' : 'border border-hair text-ash hover:text-bone'
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
