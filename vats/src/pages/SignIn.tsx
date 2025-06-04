import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Link,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import { awsConfig } from '../aws-config';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Check if Google authentication is enabled
  const googleAuthEnabled = awsConfig.googleAuthEnabled;
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      // Redirect is handled automatically by OAuth flow
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
      setGoogleLoading(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome to V.A.T.S.
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Various Amateur Tournaments Showdown
        </Typography>
        
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>
        
        {googleAuthEnabled && (
          <>
            <Divider sx={{ my: 2 }}>OR</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              sx={{ 
                mt: 1, 
                mb: 2,
                bgcolor: '#fff',
                color: '#757575',
                borderColor: '#dadce0',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  borderColor: '#dadce0'
                }
              }}
            >
              {googleLoading ? <CircularProgress size={24} /> : 'Sign in with Google'}
            </Button>
          </>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link component="button" onClick={() => navigate('/signup')} variant="body2">
            Don't have an account? Sign up
          </Link>
          
          <Link component="button" onClick={() => navigate('/reset-password')} variant="body2">
            Forgot password?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignIn;