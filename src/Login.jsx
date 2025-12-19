import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

// API URL'ini dinamik olarak tanımlıyoruz
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Login = () => {
    const navigate = useNavigate();

    // State'ler
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("Login işlemi başlatıldı...");

        try {
            // URL kısmını API_BASE_URL kullanacak şekilde güncelledik
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log("Sunucu cevabı:", response.status);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                console.log("Giriş başarılı, Dashboard'a yönlendiriliyor...");
                navigate('/');
            } else {
                setError('Login failed! Check your email or password.');
            }
        } catch (err) {
            console.error("Bağlantı Hatası:", err);
            setError('Server connection failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-screen">
            <div className="left-pane">
                <div className="brand-logo">
                    <span className="macro">Macro</span><span className="chef">Chef</span>
                </div>

                <div className="form-container">
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div style={{color: 'red', marginBottom: '10px', fontSize: '0.9rem'}}>{error}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Signing in...' : 'Log In'}
                        </button>
                    </form>

                    <div className="auth-link">
                        New to MacroChef? <Link to="/register">Create an account</Link>
                    </div>
                </div>
            </div>

            <div className="right-pane" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop')"
            }}></div>
        </div>
    );
};

export default Login;