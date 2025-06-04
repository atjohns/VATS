import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Link,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Create Account', 'Verify Email'];

const SignUp: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, confirmSignUp, resendConfirmationCode } = useAuth();
  const navigate = useNavigate();
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await signUp(email, password, name);
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await confirmSignUp(email, verificationCode);
      alert('Account verified successfully! Please sign in.');
      navigate('/signin');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      await resendConfirmationCode(email);
      alert('Verification code resent to your email');
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending the code');
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
          maxWidth: 500, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create an Account
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}
        
        {activeStep === 0 ? (
          <form onSubmit={handleSignUp}>
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
              helperText="Password must be at least 8 characters with uppercase, lowercase, and numbers"
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
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link component="button" onClick={() => navigate('/signin')} variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <Typography variant="body1" gutterBottom>
              We've sent a verification code to your email. Please enter it below.
            </Typography>
            
            <TextField
              label="Verification Code"
              fullWidth
              margin="normal"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              autoFocus
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="text" 
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Back
              </Button>
              
              <Button 
                variant="text" 
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default SignUp;