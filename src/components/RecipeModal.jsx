import React from 'react';
import '../styles/Modal.css';

const RecipeModal = ({ recipe, onClose }) => {
    if (!recipe) return null;

    return (

        <div className="modal-overlay" onClick={onClose}>

            {/* Modal İçeriği: İçeriğe tıklayınca kapanmasın (stopPropagation) */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Kapatma Butonu */}
                <button className="close-modal-btn" onClick={onClose}>&times;</button>

                {/* Büyük Resim */}
                <div className="modal-image-header" style={{
                    backgroundImage: `url(${recipe.imageUrl && recipe.imageUrl !== 'none' ? recipe.imageUrl : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800'})`
                }}></div>

                <div className="modal-body">

                    {/* Başlık ve Kategori */}
                    <div className="modal-title-row">
                        <h2>{recipe.title}</h2>
                        {recipe.category && (
                            <span className="modal-category-tag">
                                {recipe.category.name}
                            </span>
                        )}
                    </div>

                    {/* Besin Değerleri (Macros) */}
                    <div className="nutrition-grid">
                        <div className="nutrition-item">
                            <span className="nutrition-value">🔥 {recipe.totalCalories ? recipe.totalCalories.toFixed(0) : 0}</span>
                            <span className="nutrition-label">Calories</span>
                        </div>
                        <div className="nutrition-item">
                            <span className="nutrition-value" style={{color:'#ef4444'}}>🥩 {recipe.totalProtein ? recipe.totalProtein.toFixed(1) : 0}g</span>
                            <span className="nutrition-label">Protein</span>
                        </div>
                        <div className="nutrition-item">
                            <span className="nutrition-value" style={{color:'#eab308'}}>🍞 {recipe.totalCarb ? recipe.totalCarb.toFixed(1) : 0}g</span>
                            <span className="nutrition-label">Carbs</span>
                        </div>
                        <div className="nutrition-item">
                            <span className="nutrition-value" style={{color:'#3b82f6'}}>🥑 {recipe.totalFat ? recipe.totalFat.toFixed(1) : 0}g</span>
                            <span className="nutrition-label">Fat</span>
                        </div>
                    </div>

                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 className="modal-section-title">Ingredients</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {recipe.ingredients.map((ing, idx) => {

                                    const ingredientName =
                                        ing.ingredient?.name ||
                                        ing.name ||
                                        "Unknown Ingredient";

                                    return (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '1.2rem' }}>🥗</span>
                                            <span>
                                                <strong>{ing.amountInGrams}g</strong> {ingredientName}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* Tarif Adımları / Açıklama */}
                    <div>
                        <h3 className="modal-section-title">Instructions</h3>
                        <p className="description-text">
                            {recipe.instructions || recipe.description || "No instructions provided for this recipe."}
                        </p>
                    </div>

                    {/* Paylaşan Kişi Bilgisi */}
                    {recipe.user && (
                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#94a3b8' }}>
                            Recipe by <strong>@{recipe.user.username}</strong>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default RecipeModal;