import "react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../style/loginForm.scss";
import "../style/_shared.scss";

/**
 * Composant de formulaire de connexion.
 * Permet aux utilisateurs de saisir leur identifiant et leur mot de passe pour se connecter.
 *
 * @component
 */
function LoginForm() {
    // État local pour stocker le nom d'utilisateur et le mot de passe
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Fonction de connexion récupérée depuis le contexte d'authentification
    const { handleLogin } = useAuth();

    /**
     * Gère la soumission du formulaire.
     * Appelle la fonction de connexion avec les informations saisies.
     *
     * @param {React.FormEvent} e - Événement de soumission du formulaire.
     */
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleLogin(username, password);
    }

    return (
        <div className="general-bg brushed-metal">
            <div className="glow-effect"></div>
            <div className="login-center">
                <div className="login-logo">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="logo-svg"
                    >
                        <path d="M12 2L2 8.5l10 13.5 10-13.5L12 2z" />
                        <path d="M12 2v20" />
                        <path d="M2 8.5h20" />
                        <path d="M5 15l-3 4" />
                        <path d="M19 15l3 4" />
                        <path d="M5 15h14" />
                        <path d="M8.5 8.5L7 12" />
                        <path d="M15.5 8.5L17 12" />
                    </svg>
                </div>
                <h1 className="login-title">SYSTEM LOGIN</h1>
                <div className="login-container">
                    <form onSubmit={handleSubmit}>
                        {/* Champ pour saisir l'identifiant */}
                        <div className="form-row">
                            <label htmlFor="username">ACCESS ID</label>
                            <input
                                id="username"
                                name="username"
                                type="username"
                                placeholder="Enter your access ID"
                                autoComplete="username"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        {/* Champ pour saisir le mot de passe */}
                        <div className="form-row">
                            <label htmlFor="password">PASSCODE</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {/* Bouton pour soumettre le formulaire */}
                        <button type="submit">ENGAGE</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;

