import React from 'react';
import { handleGoogleSignIn } from '../../firebase/authService';

const Login = () => {
    return (
        <div className="container center-screen">
            <div className="card">
                <h1>Split App</h1>
                <p>Inicia sesión para dividir gastos con tu pareja o amigos.</p>
                <button onClick={handleGoogleSignIn} className="button primary">
                    Iniciar Sesión con Google
                </button>
            </div>
        </div>
    );
};

export default Login;