export default function ModuleCard({ title, description }) {
  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
