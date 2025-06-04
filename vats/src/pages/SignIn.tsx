import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
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