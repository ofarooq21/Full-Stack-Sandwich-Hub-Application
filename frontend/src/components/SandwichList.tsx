import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

interface Sandwich {
  id: number;
  sandwich_name: string;
  price: number;
}

const SandwichList = () => {
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [open, setOpen] = useState(false);
  const [newSandwich, setNewSandwich] = useState({ sandwich_name: '', price: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSandwiches = async () => {
    try {
      const response = await axios.get('http://localhost:8000/sandwiches');
      setSandwiches(response.data);
    } catch (error) {
      setError('Failed to fetch sandwiches. Please try again later.');
      console.error('Error fetching sandwiches:', error);
    }
  };

  useEffect(() => {
    fetchSandwiches();
  }, []);

  const handleAddSandwich = async () => {
    if (!newSandwich.sandwich_name || !newSandwich.price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await axios.post('http://localhost:8000/sandwiches', {
        sandwich_name: newSandwich.sandwich_name,
        price: parseFloat(newSandwich.price),
      });
      setOpen(false);
      setNewSandwich({ sandwich_name: '', price: '' });
      setSuccess('Sandwich added successfully!');
      fetchSandwiches();
    } catch (error) {
      setError('Failed to add sandwich. Please try again.');
      console.error('Error adding sandwich:', error);
    }
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpen(true)}
            sx={{ mb: 2 }}
          >
            Add New Sandwich
          </Button>
        </Grid>
        {sandwiches.map((sandwich) => (
          <Grid item xs={12} sm={6} md={4} key={sandwich.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {sandwich.sandwich_name}
                </Typography>
                <Typography variant="h5" color="primary">
                  ${sandwich.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Sandwich</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sandwich Name"
            fullWidth
            value={newSandwich.sandwich_name}
            onChange={(e) => setNewSandwich({ ...newSandwich, sandwich_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newSandwich.price}
            onChange={(e) => setNewSandwich({ ...newSandwich, price: e.target.value })}
            InputProps={{
              startAdornment: '$',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSandwich} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SandwichList; 