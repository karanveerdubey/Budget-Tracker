import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

/**
 * VisionUploader
 *
 * Props:
 *   - onReceiptParsed (function) [optional]: 
 *       Called when GPT-4o-mini returns structured receipt data. 
 *       Receives an object like: { date, vendor, amount }.
 */
function VisionUploader({ onReceiptParsed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [detail, setDetail] = useState('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImageUrl(''); // clear any typed URL
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setSelectedFile(null); // clear any chosen file
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      // Prepare form data for the backend
      const formData = new FormData();
      formData.append('detail', detail);

      if (selectedFile) {
        formData.append('imageFile', selectedFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      // Send to your server route
      const response = await axios.post(
        'http://localhost:5000/api/vision',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        const { structured } = response.data;

        // If there's a structured object and a parent callback,
        // pass it up so we can auto-fill the form
        if (structured && onReceiptParsed) {
          onReceiptParsed(structured);
        }
      } else {
        setError(response.data.error || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        marginTop: 4,
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: '#ffffff',
        maxWidth: 400,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Scan a Receipt or Image
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <FormControl component="fieldset" sx={{ marginBottom: 2 }}>
        
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2" gutterBottom>
            Upload a File:
          </Typography>
          <TextField
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={handleFileChange}
            fullWidth
          />
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2" gutterBottom>
            Or Enter an Image URL:
          </Typography>
          <TextField
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            fullWidth
          />
        </Box>
      </FormControl>
      
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || (!selectedFile && !imageUrl)}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze Image'}
      </Button>
    </Box>
  );
}

export default VisionUploader;
