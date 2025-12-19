import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const headers = { 'Authorization': `Bearer ${token}` };


                const [pRes, rRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/users/me`, { headers }),
                    fetch(`${API_BASE_URL}/api/recipes/my-recipes`, { headers })
                ]);

                if (pRes.ok && rRes.ok) {
                    setProfile(await pRes.json());
                    setMyRecipes(await rRes.json());
                }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) return <div className="loading-state">Loading Profile...</div>;

    return (
        <div className="profile-page-wrapper">

            <nav className="top-navbar profile-nav">
                <div className="nav-left">
                    <button className="white-back-btn" onClick={() => navigate('/')}>⬅ Back to Dashboard</button>
                </div>
                <div className="nav-center">
                    <div className="brand-logo-large">
                        <span className="macro">Macro</span><span className="chef">Chef</span>
                    </div>
                </div>
                <div className="nav-right" style={{width: '120px'}}></div>
            </nav>

            <main className="profile-main-content">

                <section className="profile-header-card">
                    <div className="profile-cover"></div>
                    <div className="profile-info-content">
                        <div className="profile-avatar-main">
                            {profile?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h1 className="profile-name-title">{profile?.username}</h1>
                        <p className="profile-email-text">{profile?.email}</p>

                        <div className="profile-stats-bar">
                            <div className="stat-item">
                                <span className="stat-value">{myRecipes.length}</span>
                                <span className="stat-label">Shared Recipes</span>
                            </div>
                            <div className="stat-sep"></div>
                            <div className="stat-item">
                                <span className="stat-value">{profile?.favoritesReceived || 0}</span>
                                <span className="stat-label">Total Likes</span>
                            </div>
                            <div className="stat-sep"></div>
                            <div className="stat-item">
                                <span className="stat-value">{profile?.joinedAt ? new Date(profile.joinedAt).getFullYear() : '2025'}</span>
                                <span className="stat-label">Member Since</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* GALERİ BÖLÜMÜ */}
                <div className="gallery-header">
                    <h2>My Culinary Gallery</h2>
                    <p>Recipes created by you</p>
                    <div className="accent-line"></div>
                </div>

                <div className="feed-grid">
                    {myRecipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card">
                            <div className="card-image" style={{
                                backgroundImage: `url(${recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'})`
                            }}>
                                <span className="cal-badge">🔥 {recipe.totalCalories?.toFixed(0)} kcal</span>
                            </div>
                            <div className="card-content">
                                <h3>{recipe.title}</h3>
                                <p className="description">{recipe.description}</p>
                                <div className="card-footer">
                                    <div className="macro-pill protein">
                                        <span>💪 {recipe.totalProtein?.toFixed(1)}g Protein</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {myRecipes.length === 0 && (
                        <div className="empty-profile-state">
                            <p>You haven't shared any recipes yet.</p>
                            <button onClick={() => navigate('/create-recipe')}>Create Your First Recipe</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;