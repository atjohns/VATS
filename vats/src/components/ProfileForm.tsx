import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { getUserProfile, updateUserProfile, UserProfile } from '../services/api';

interface ProfileFormProps {
  onProfileUpdated?: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setName(profile.name || '');
        if (profile.profilePictureUrl) {
          setProfilePictureUrl(profile.profilePictureUrl);
        }
      } catch (error) {
        console.error('Error fetching a profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePicture(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfilePictureUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      const updatedProfile = await updateUserProfile(name, profilePicture || undefined);
      
      if (onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 500, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Your Profile
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={profilePictureUrl || undefined}
            alt={name}
            sx={{ width: 100, height: 100 }}
          />
          <Button variant="outlined" component="label">
            Choose Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={saving}
          sx={{ mt: 2 }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Profile'}
        </Button>
      </Box>
    </form>
  );
};

export default ProfileForm;