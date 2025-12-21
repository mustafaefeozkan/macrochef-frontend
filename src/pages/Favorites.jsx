import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import '../styles/Dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Favorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SIDEBAR STATE'LERİ ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);
    const closeAll = () => { setIsSidebarOpen(false); setIsNotifOpen(false); };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- FAVORİLERİ ÇEK ---
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const res = await fetch(`${API_BASE_URL}/api/favorites`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Backend array dönüyor, direkt set ediyoruz
                    setFavorites(Array.isArray(data) ? data : []);
                } else if (res.status === 401 || res.status === 403) {
                    navigate('/login');
                }
            } catch (err) {
                console.error("Favori yükleme hatası:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [navigate]);

    // --- FAVORİDEN ÇIKARMA (REMOVE) ---
    const removeFavorite = async (recipeId) => {
        // 1. Önce UI'dan sil (Kullanıcı beklemesin)
        setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));

        // 2. Backend'e isteği at (Toggle mantığıyla çalışır: Varsa siler)
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/favorites/${recipeId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // Hata olursa kullanıcıyı uyar veya geri yükle (Opsiyonel)
                console.error("Silme işlemi başarısız oldu.");
            }
        } catch (err) {
            console.error("Bağlantı hatası:", err);
        }
    };

    if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'100px', color:'#666'}}>Loading Collection... ❤️</div>;

    return (
        <div className="dashboard-container">

            {/* OVERLAY */}
            {(isSidebarOpen || isNotifOpen) && <div className="overlay" onClick={closeAll}></div>}

            {/* SIDEBARLAR */}
            <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header"><span>Menu</span><button className="close-btn" onClick={closeAll}>&times;</button></div>
                <ul className="sidebar-links">
                    <li onClick={() => navigate('/dashboard')}>🏠 Dashboard</li>
                    <li onClick={() => navigate('/create-recipe')}>🍳 Create Recipe</li>
                    <li onClick={() => navigate('/favorites')} style={{color:'var(--chef-orange)'}}>❤️ Favorites</li>
                    <li onClick={() => navigate('/profile')}>👤 My Profile</li>
                    <li className="logout-item" onClick={handleLogout}>🚪 Logout</li>
                </ul>
            </div>

            <div className={`notification-sidebar ${isNotifOpen ? 'open' : ''}`}>
                <div className="sidebar-header"><span>Notifications</span><button className="close-btn" onClick={closeAll}>&times;</button></div>
                <div className="notif-content"><div className="empty-notif"><span style={{fontSize: '2rem'}}>💖</span><p>Your loved recipes.</p></div></div>
            </div>

            {/* NAVBAR */}
            <nav className="top-navbar">
                <div className="nav-left"><button className="icon-btn" onClick={toggleSidebar}>☰</button></div>
                <div className="nav-center">
                    <div className="brand-logo-large" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
                        <span className="macro">Macro</span><span className="chef">Chef</span>
                    </div>
                </div>
                <div className="nav-right"><button className="icon-btn" onClick={toggleNotif}>🔔</button></div>
            </nav>

            {/* ANA İÇERİK */}
            <div className="main-content-area">

                <div style={{textAlign:'center', marginBottom:'40px'}}>
                    <h2 style={{fontSize:'2rem', color:'var(--text-dark)', fontWeight:'800'}}>My Favorites</h2>
                    <p style={{color:'var(--text-gray)'}}>Recipes you saved for later</p>
                </div>

                {favorites.length === 0 ? (
                    <div className="empty-state">
                        <span style={{fontSize:'3rem'}}>💔</span>
                        <p>No favorites yet.</p>
                        <button onClick={() => navigate('/dashboard')}>Go Explore</button>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {favorites.map((recipe) => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="card-image" style={{
                                    backgroundImage: `url(${recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'})`
                                }}>

                                    {/* SİLME BUTONU (Dolu Kalp) */}
                                    <button
                                        className="fav-btn active"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(recipe.id);
                                        }}
                                        title="Remove from favorites"
                                        style={{ color: '#ef4444' }} // Kırmızı Kalp
                                    >
                                        ❤️
                                    </button>

                                    <span className="cal-badge">🔥 {recipe.totalCalories?.toFixed(0)} kcal</span>
                                </div>
                                <div className="card-content">
                                    <h3>{recipe.title}</h3>
                                    <p className="description">
                                        {recipe.description?.substring(0, 60)}...
                                    </p>
                                    <div className="macro-pill">
                                        💪 {recipe.totalProtein?.toFixed(1)}g Protein
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;