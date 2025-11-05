import React from "react";
import styles from "../style/LoginForm.module.scss";


const LoginForm: React.FC = () =>  (
    <div className={styles["login-container"]}>
        <div className={styles.loginForm}>
        <h1 className="login-title">Sign in to your account</h1>
        <form className="login-form">
            <label>
                Access Key ID:
                <input type="text" name="username" />
            </label>
            <div className="login-row">
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>

            </div>
            <button type="submit" className="login-button">Sign In</button>
        </form>
        </div>
    </div>

);
export default LoginForm;