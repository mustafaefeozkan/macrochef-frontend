import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import '../styles/Profile.css';
import '../styles/Dashboard.css'; // Kalp butonu stili buradan geliyor

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✨ YENİ: Favori ID'lerini tutan state
    const [favoriteIds, setFavoriteIds] = useState([]);

    // --- SIDEBAR STATE'LERİ ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);
    const closeAll = () => { setIsSidebarOpen(false); setIsNotifOpen(false); };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const headers = { 'Authorization': `Bearer ${token}` };

                // 3 İsteği Aynı Anda Atıyoruz: Profil, Tariflerim ve Favorilerim
                const [pRes, rRes, fRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/users/me`, { headers }),
                    fetch(`${API_BASE_URL}/api/recipes/my-recipes`, { headers }),
                    fetch(`${API_BASE_URL}/api/favorites`, { headers }) // ✨ Favorileri de çekiyoruz
                ]);

                if (pRes.ok && rRes.ok) {
                    setProfile(await pRes.json());
                    setMyRecipes(await rRes.json());
                }

                // ✨ Favori listesini işle
                if (fRes.ok) {
                    const favData = await fRes.json();
                    if (Array.isArray(favData)) {
                        setFavoriteIds(favData.map(f => f.id));
                    }
                }

            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // ✨ YENİ: Favori Ekle/Çıkar Fonksiyonu (Dashboard ile aynı)
    const toggleFavorite = async (recipeId) => {
        // 1. UI Güncelle (Hızlı Tepki)
        const isCurrentlyFav = favoriteIds.includes(recipeId);
        let newFavIds;

        if (isCurrentlyFav) {
            newFavIds = favoriteIds.filter(id => id !== recipeId);
        } else {
            newFavIds = [...favoriteIds, recipeId];
        }
        setFavoriteIds(newFavIds);

        // 2. Backend İsteği
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/favorites/${recipeId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // Hata olursa geri al
                if (isCurrentlyFav) setFavoriteIds([...newFavIds, recipeId]);
                else setFavoriteIds(favoriteIds.filter(id => id !== recipeId));
            }
        } catch (err) {
            console.error("Favori hatası:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', color: '#666' }}>
            Loading Profile...
        </div>
    );

    return (
        <div className="profile-page-wrapper">

            {/* OVERLAY */}
            {(isSidebarOpen || isNotifOpen) && (
                <div className="overlay" onClick={closeAll}></div>
            )}

            {/* SOL SIDEBAR */}
            <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>Menu</span>
                    <button className="close-btn" onClick={closeAll}>&times;</button>
                </div>
                <ul className="sidebar-links">
                    <li onClick={() => navigate('/dashboard')}>🏠 Dashboard</li>
                    <li onClick={() => navigate('/create-recipe')}>🍳 Create Recipe</li>
                    <li onClick={() => navigate('/favorites')}>❤️ Favorites</li>
                    <li onClick={() => navigate('/profile')} style={{color:'var(--chef-orange)'}}>👤 My Profile</li>
                    <li className="logout-item" onClick={handleLogout}>🚪 Logout</li>
                </ul>
            </div>

            {/* SAĞ SIDEBAR */}
            <div className={`notification-sidebar ${isNotifOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>Notifications</span>
                    <button className="close-btn" onClick={closeAll}>&times;</button>
                </div>
                <div className="notif-content">
                    <div className="empty-notif">
                        <span style={{fontSize: '2rem'}}>🎉</span>
                        <p>No new notifications</p>
                    </div>
                </div>
            </div>

            {/* NAVBAR */}
            <nav className="top-navbar">
                <div className="nav-left">
                    <button className="icon-btn" onClick={toggleSidebar}>☰</button>
                </div>
                <div className="nav-center">
                    <div className="brand-logo-large" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
                        <span className="macro">Macro</span><span className="chef">Chef</span>
                    </div>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleNotif}>🔔</button>
                </div>
            </nav>

            {/* ANA İÇERİK */}
            <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* PROFIL KARTI */}
                <section className="profile-header-card">
                    <div className="profile-cover"></div>

                    <div className="profile-avatar-main">
                        {profile?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h1>{profile?.username}</h1>
                    <p className="profile-email-text">{profile?.email}</p>

                    <div className="profile-stats-bar">
                        <div className="stat-item">
                            <span className="stat-value">{myRecipes.length}</span>
                            <span className="stat-label">Recipes</span>
                        </div>
                        <div className="stat-sep"></div>
                        <div className="stat-item">
                            <span className="stat-value">{profile?.favoritesReceived || 0}</span>
                            <span className="stat-label">Likes</span>
                        </div>
                        <div className="stat-sep"></div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {profile?.joinedAt ? new Date(profile.joinedAt).getFullYear() : '2025'}
                            </span>
                            <span className="stat-label">Joined</span>
                        </div>
                    </div>
                </section>

                {/* GALERİ BAŞLIĞI */}
                <div className="gallery-header">
                    <h2>My Culinary Gallery</h2>
                    <p>Recipes created by you</p>
                </div>

                {/* TARİF LİSTESİ */}
                <div className="main-content-area" style={{paddingTop: '0'}}>
                    <div className="feed-grid">
                        {myRecipes.map((recipe) => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="card-image" style={{
                                    backgroundImage: `url(${recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'})`
                                }}>

                                    {/* ✨ KALP BUTONU (Buraya da eklendi) ✨ */}
                                    <button
                                        className={`fav-btn ${favoriteIds.includes(recipe.id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(recipe.id);
                                        }}
                                        title={favoriteIds.includes(recipe.id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        {favoriteIds.includes(recipe.id) ? '❤️' : '♡'}
                                    </button>

                                    <span className="cal-badge">🔥 {recipe.totalCalories?.toFixed(0)} kcal</span>
                                </div>
                                <div className="card-content">
                                    <h3>{recipe.title}</h3>
                                    <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'10px'}}>
                                        {recipe.description?.substring(0, 60)}...
                                    </p>
                                    <div className="macro-pill" style={{display:'inline-block'}}>
                                        💪 {recipe.totalProtein?.toFixed(1)}g Protein
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {myRecipes.length === 0 && (
                        <div style={{textAlign:'center', marginTop:'20px', color:'#999'}}>
                            <p>You haven't shared any recipes yet.</p>
                            <button
                                onClick={() => navigate('/create-recipe')}
                                className="auth-button"
                                style={{marginTop:'10px', width:'auto', padding:'10px 30px'}}
                            >
                                Create Your First Recipe
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default Profile;