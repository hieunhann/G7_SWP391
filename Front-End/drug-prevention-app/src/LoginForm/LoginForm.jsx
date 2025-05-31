import  React from "react";
import './LoginForm.css';

const LoginForm = () => {
    return (
        <div className="login-form">
            <form action="">
                <div className="input-box">
                <input type="text" placeholder="Username" required />
                </div>
                  <div className="input-box">
                <input type="password" placeholder="Password" required />
                </div>
                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" />
                        Remember me
                    </label>
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="btn">Login</button>
                <div className="register">
                    <p>Don't have an account? <a href="#">Register</a></p>
                </div>
            </form>
        </div>
      
       
    );
    }