import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ScoreRadar({ score }) {
  if (!score) return null;
  const data = [
    { axis: 'GitHub', value: score.github_score },
    { axis: 'Competitive', value: score.cp_score },
    { axis: 'Achievements', value: score.achievement_score },
    { axis: 'Projects', value: score.project_score },
    { axis: 'LinkedIn', value: score.linkedin_score },
    { axis: 'Daily', value: score.daily_score || 0 },
    { axis: 'Social', value: score.social_score || 0 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#262E3B" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#8B93A1', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#5EE6C5" fill="#5EE6C5" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
