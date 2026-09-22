"use client";
import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  // NEW: Loading state to prevent multiple clicks and show progress
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Disable button and update text

    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';

    try {
      // ✅ Updated to point to your new Vercel serverless API!
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        if (isLogin) {
          onLogin(data.user); // Pass the logged-in user up to page.js
        } else {
          setIsLogin(true); // Switch to login view
          setError('Registration successful! Please login.'); // Show success message
        }
      } else {
        setError(data.message || data.error);
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false); // Re-enable the button when done
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#2ECC71', marginBottom: '20px' }}>
          Green Route AI
        </h2>

        {/* Back to Home Button */}
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <button onClick={() => window.location.reload()} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: "14px" }}>
            ← Back to Home
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="username" placeholder="Username" required value={formData.username} onChange={handleChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

          {!isLogin && (
            <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
          )}

          <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

          {error && (
            <p style={{ 
              fontSize: '14px', 
              margin: 0, 
              color: error.includes('successful') ? '#155724' : 'red',
              backgroundColor: error.includes('successful') ? '#d4edda' : 'transparent',
              padding: error.includes('successful') ? '10px' : '0',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading} // Prevents double-clicking
            style={{ 
              backgroundColor: loading ? '#95a5a6' : '#2ECC71', 
              color: 'white', 
              padding: '10px', 
              border: 'none', 
              borderRadius: '5px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Connecting...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: '#3498DB', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}