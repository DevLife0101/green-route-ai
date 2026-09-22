"use client";

export default function Tutorial({ onClose }) {
  const steps = [
    { emoji: "📍", title: "Select Route", text: "Click anywhere on the map to set your Start Point, then click again to set your Destination." },
    { emoji: "⚖️", title: "Compare Impact", text: "We will calculate the Standard Route (blue) and the Eco Route (green) which saves CO₂." },
    { emoji: "🌱", title: "Earn Points", text: "Choose the Eco Route to save it to your history and earn Eco Points based on the distance." },
    { emoji: "🏆", title: "Climb the Ranks", text: "Check the Green Dashboard to see your history and compete on the Global Leaderboard!" }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
        width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', 
          background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666'
        }}>✖</button>

        <h2 style={{ margin: '0 0 5px 0', color: '#2ECC71' }}>How to use Green Route 🌍</h2>
        <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>Follow these steps to reduce emissions and earn points.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', backgroundColor: '#e8f8f5', padding: '10px', borderRadius: '50%' }}>
                {step.emoji}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{step.title}</h4>
                <p style={{ margin: 0, color: '#555', fontSize: '13px', lineHeight: '1.4' }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', marginTop: '25px', padding: '12px', backgroundColor: '#2ECC71',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
        }}>
          Let's Go!
        </button>
      </div>
    </div>
  );
}