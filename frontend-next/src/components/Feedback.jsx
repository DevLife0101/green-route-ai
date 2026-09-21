"use client";
import { useState } from 'react';

export default function Feedback({ currentUser, onClose }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send to your live Render backend
    const res = await fetch('https://green-route-node.onrender.com/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser?.username,
        rating,
        text
      })
    });

    if (res.ok) setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
        width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', 
          background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'
        }}>✖</button>

        {submitted ? (
          <div style={{ textAlign: 'center', color: '#2ECC71' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>🌱 Thank You!</h2>
            <p>Your feedback helps us make Green Route AI better.</p>
            <button onClick={onClose} style={{
              marginTop: '15px', padding: '10px 20px', backgroundColor: '#2ECC71',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Help Us Improve 🚀</h2>
            
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#555' }}>Rate your experience:</p>
              <div style={{ display: 'flex', gap: '10px', fontSize: '24px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} onClick={() => setRating(num)} style={{ opacity: rating >= num ? 1 : 0.3 }}>
                    🌱
                  </span>
                ))}
              </div>
            </div>

            <textarea 
              required
              placeholder="What can we do better? Found any bugs?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc',
                minHeight: '100px', resize: 'vertical', fontFamily: 'inherit'
              }}
            />

            <button type="submit" style={{
              backgroundColor: '#2ECC71', color: 'white', padding: '12px', border: 'none',
              borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
            }}>
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}