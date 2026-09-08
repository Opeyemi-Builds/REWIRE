export default function OpportunityCard({ title, description }) {
  return (
    <div style={{ padding: '1rem', borderRadius: '12px', background: '#ecfeff', border: '1px solid #a5f3fc' }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
