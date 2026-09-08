export default function ScoreBadge({ score = 0 }) {
  return (
    <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '0.4rem 0.8rem', borderRadius: '999px' }}>
      {score}%
    </span>
  );
}
