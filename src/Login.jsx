import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

const Login = () => {
    const navigate = useNavigate();


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {

            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('token', data.token);
                navigate('/');
            } else {

                setError('Invalid email or password.');
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

                    <h2>Welcome Back</h2>
                    <p className="subtitle">Login to track your nutrition journey.</p>

                    {error && <div style={{color: '#ef4444', marginBottom: '15px', textAlign:'center'}}>{error}</div>}

                    <form onSubmit={handleLogin}>
                        {/* Username yok, sadece Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@macrochef.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" className="auth-button">
                            Log In
                        </button>
                    </form>

                    <div className="auth-link">
                        New to MacroChef? <Link to="/register">Create an account</Link>
                    </div>
                </div>
            </div>


            <div className="right-pane" style={{

                backgroundImage: "url('https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1000&auto=format&fit=crop')"
            }}>
            </div>
        </div>
    );
};

export default Login;