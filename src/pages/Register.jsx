import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const API_BASE_URL = "https://macrochef-backend.onrender.com";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Account created! Please login.");
                navigate('/login');
            } else {
                const txt = await response.text();
                setError(txt);
            }
        } catch {
            setError('Error connecting to server.');
        }
    };

    return (
        <div className="split-screen">
            <div className="left-pane">
                <div className="form-container">
                    <div style={{ textAlign: 'center' }}>
                        <div className="brand-logo">
                            <span className="macro">Macro</span>
                            <span className="chef">Chef</span>
                        </div>
                    </div>

                    <h2>Create Account</h2>
                    <p className="subtitle">Start your healthy journey today.</p>

                    {error && <div style={{color: '#ef4444', marginBottom: '15px', textAlign:'center'}}>{error}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="J.Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="auth-button">
                            Register
                        </button>
                    </form>

                    <div className="auth-link">
                        Already a member? <Link to="/login">Sign In</Link>
                    </div>
                </div>
            </div>

            <div className="right-pane" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop')"
            }}>
            </div>
        </div>
    );
};

export default Register;