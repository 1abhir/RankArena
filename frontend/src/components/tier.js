export function getTier(score) {
  if (score >= 800) return { name: 'Diamond', color: '#B79CF2' };
  if (score >= 600) return { name: 'Platinum', color: '#7FD8E0' };
  if (score >= 400) return { name: 'Gold', color: '#E8B94B' };
  if (score >= 200) return { name: 'Silver', color: '#A6ADBB' };
  return { name: 'Bronze', color: '#C97C4A' };
}
