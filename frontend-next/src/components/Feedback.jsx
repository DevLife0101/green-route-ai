"use client";
import { useState } from 'react';

export default function Feedback({ currentUser, onClose }) {
  // Pre-fill the name with the username if available
  const [name, setName] = useState(currentUser?.username || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable the button while sending
    
    try {
      // ✅ Updated to point to your new Vercel serverless API!
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          name,
          email,
          phone,
          rating,
          text
        })
      });

      if (res.ok) setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      setLoading(false); // Re-enable the button if it fails
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', 
    border: '1px solid #ccc', fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
        width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', 
          background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666'
        }}>✖</button>

        {submitted ? (
          <div style={{ textAlign: 'center', color: '#2ECC71', padding: '20px 0' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>🌱 Thank You!</h2>
            <p style={{ color: '#555' }}>We have received your message and will get back to you if needed.</p>
            <button onClick={onClose} style={{
              marginTop: '15px', padding: '10px 25px', backgroundColor: '#2ECC71',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Contact Us ✉️</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Let us know how we can help or improve.</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Name</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Your Name" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Phone (Optional)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="Your Phone" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Rate your experience</label>
              <div style={{ display: 'flex', gap: '10px', fontSize: '24px', cursor: 'pointer', marginTop: '5px' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} onClick={() => setRating(num)} style={{ opacity: rating >= num ? 1 : 0.3 }}>
                    🌱
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Message</label>
              <textarea 
                required
                placeholder="What can we do better? Found any bugs? Need help?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              backgroundColor: loading ? '#95a5a6' : '#3498DB', color: 'white', padding: '12px', border: 'none',
              borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', marginTop: '5px'
            }}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}