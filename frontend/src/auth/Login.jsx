import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        
        login(userInfo.data);
        navigate('/');
      } catch (err) {
        setError('Failed to get user information');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  });

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome to Health Sutra</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <button
          onClick={() => googleLogin()}
          disabled={isLoading}
          className="google-button"
        >
          <FcGoogle className="google-icon" />
          <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>
        
        <div className="divider">
          <span className="divider-text">Secure authentication</span>
        </div>
      </div>
    </div>
  );
}

export default Login; 