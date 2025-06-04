import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Link,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const { signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signUp(email, password, name);
      if (result.nextStep?.code === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset errors
    setConfirmError('');
    setConfirmLoading(true);
    
    try {
      await confirmSignUp(email, confirmationCode);
      setConfirmSuccess(true);
      // Redirect to sign in after a short delay
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err: any) {
      setConfirmError(err.message || 'An error occurred during confirmation');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 500, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create an Account
        </Typography>
        
        {!needsConfirmation ? (
          <>
            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="Password must be at least 8 characters"
              />
              
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
            </form>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link component="button" onClick={() => navigate('/signin')} variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </>
        ) : (
          <>
            <Alert severity="info">
              A verification code has been sent to your email address.
              Please enter it below to complete your registration.
            </Alert>
            
            {confirmError && (
              <Typography color="error" align="center">
                {confirmError}
              </Typography>
            )}
            
            {confirmSuccess && (
              <Alert severity="success">
                Your account has been verified successfully! Redirecting to login...
              </Alert>
            )}
            
            {!confirmSuccess && (
              <form onSubmit={handleConfirmation}>
                <TextField
                  label="Confirmation Code"
                  fullWidth
                  margin="normal"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  autoFocus
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={confirmLoading}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {confirmLoading ? <CircularProgress size={24} /> : 'Confirm'}
                </Button>
              </form>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SignUp;