import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './App.css';


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>


                <Route path="/login" element={<Login />} />


                <Route path="/register" element={<Register />} />


                <Route path="/" element={
                    <ProtectedRoute>
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h1>Welcome to MacroChef</h1>
                            <p>You have successfully logged in.</p>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.reload();
                                }}
                                style={{ marginTop: '20px', padding: '10px', cursor: 'pointer', background: 'red', color: 'white' }}
                            >
                                Logout
                            </button>
                        </div>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;