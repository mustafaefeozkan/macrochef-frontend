import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Stil dosyanın aynı olduğunu varsayıyorum

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();

    // Favorileri Çek
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setFavorites(data);
                }
            } catch (err) {
                console.error("Favoriler çekilemedi", err);
            }
        };
        fetchFavorites();
    }, []);

    // Favoriden Çıkarma Fonksiyonu
    const toggleFav = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/favorites/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Listeden anlık olarak çıkar
                setFavorites(favorites.filter(recipe => recipe.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="top-navbar">
                <div className="brand-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
                    <span className="macro">Macro</span><span className="chef">Chef</span>
                </div>
                <div className="nav-links">
                    <button className="nav-btn" onClick={() => navigate('/')}>Dashboard</button>
                    <button className="nav-btn active">❤️ Favorites</button>
                    <button className="create-btn" onClick={() => navigate('/create-recipe')}>+ Create Recipe</button>
                </div>
            </nav>

            <header className="hero-section" style={{minHeight: '200px'}}>
                <div className="hero-content">
                    <h1>My Favorite Recipes</h1>
                    <p>Your personal collection of delicious meals.</p>
                </div>
            </header>

            <div className="recipes-grid">
                {favorites.length === 0 ? (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', marginTop: '50px'}}>
                        <h3>No favorites yet. Go explore! 🍲</h3>
                    </div>
                ) : (
                    favorites.map(recipe => (
                        <div key={recipe.id} className="recipe-card">
                            <div className="card-image" style={{backgroundImage: `url(${recipe.imageUrl})`}}>
                                <span className="category-tag">{recipe.categoryName || 'General'}</span>
                                {/* Favori Butonu (Kalp Dolu) */}
                                <button
                                    className="fav-btn"
                                    onClick={(e) => { e.stopPropagation(); toggleFav(recipe.id); }}
                                    style={{background: 'rgba(255,255,255,0.9)', color: 'red'}}
                                >
                                    ❤️
                                </button>
                            </div>
                            <div className="card-info">
                                <h3>{recipe.title}</h3>
                                <div className="macros">
                                    <span>🔥 {recipe.totalCalories?.toFixed(0) || 0} kcal</span>
                                    <span>🥩 {recipe.totalProtein?.toFixed(1) || 0}g P</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Favorites;