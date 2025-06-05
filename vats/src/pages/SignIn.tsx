import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';
import vatsLogo from '../assets/vats.png';

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithGoogle } = useAuth();
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      // Redirect is handled automatically by OAuth flow
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
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
          gap: 2,
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <img 
            src={vatsLogo} 
            alt="VATS Logo" 
            style={{ 
              height: 60,
              marginRight: 12
            }} 
          />
          <Box>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              V.A.T.S.
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Various Amateur Tournaments Showdown
            </Typography>
          </Box>
        </Box>
        
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        
        <Button
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{ 
            mt: 3, 
            mb: 3,
            py: 1.5,
            fontSize: '1.1rem',
            bgcolor: '#4285F4',
            '&:hover': {
              bgcolor: '#3367D6'
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
        </Button>
      </Paper>
    </Box>
  );
};

export default SignIn;