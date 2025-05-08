import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Rating,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Sandwich {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  ingredients: string[];
  category: string;
}

const defaultSandwich = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  ingredients: '',
  category: '',
};

const SandwichList = () => {
  const [sandwiches, setSandwiches] = useState<Sandwich[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSandwich, setEditingSandwich] = useState<Sandwich | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultSandwich);

  useEffect(() => {
    fetchSandwiches();
  }, []);

  const fetchSandwiches = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:3001/api/sandwiches');
      const validSandwiches = response.data.map((sandwich: any) => ({
        ...sandwich,
        ingredients: Array.isArray(sandwich.ingredients) ? sandwich.ingredients : [],
        rating: Number(sandwich.rating) || 0,
        price: Number(sandwich.price) || 0,
        image_url: sandwich.image_url || 'https://via.placeholder.com/200x200',
      }));
      setSandwiches(validSandwiches);
    } catch (error) {
      console.error('Error fetching sandwiches:', error);
      setError('Failed to load sandwiches. Please try again later.');
    }
  };

  const handleOpen = (sandwich?: Sandwich) => {
    try {
      if (sandwich) {
        setEditingSandwich(sandwich);
        setFormData({
          name: sandwich.name || '',
          description: sandwich.description || '',
          price: sandwich.price?.toString() || '',
          image_url: sandwich.image_url || '',
          ingredients: Array.isArray(sandwich.ingredients) ? sandwich.ingredients.join(', ') : '',
          category: sandwich.category || '',
        });
      } else {
        setEditingSandwich(null);
        setFormData(defaultSandwich);
      }
      setOpen(true);
    } catch (error) {
      console.error('Error in handleOpen:', error);
      setError('An error occurred while opening the form.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSandwich(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const sandwichData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
        rating: editingSandwich?.rating || 0,
      };

      if (editingSandwich) {
        await axios.put(`http://localhost:3001/api/sandwiches/${editingSandwich.id}`, sandwichData);
      } else {
        await axios.post('http://localhost:3001/api/sandwiches', sandwichData);
      }

      fetchSandwiches();
      handleClose();
    } catch (error) {
      console.error('Error saving sandwich:', error);
      setError('Failed to save sandwich. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sandwich?')) {
      try {
        setError(null);
        await axios.delete(`http://localhost:3001/api/sandwiches/${id}`);
        fetchSandwiches();
      } catch (error) {
        console.error('Error deleting sandwich:', error);
        setError('Failed to delete sandwich. Please try again.');
      }
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterCategory(event.target.value);
  };

  const filteredAndSortedSandwiches = sandwiches
    .filter(sandwich => 
      sandwich.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || sandwich.category === filterCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const categories = ['all', ...new Set(sandwiches.map(s => s.category).filter(Boolean))];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sandwiches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Sandwich
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search sandwiches"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange}>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter Category</InputLabel>
            <Select value={filterCategory} onChange={handleFilterChange}>
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredAndSortedSandwiches.map((sandwich) => (
          <Grid item xs={12} sm={6} md={4} key={sandwich.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={sandwich.image_url || 'https://via.placeholder.com/200x200'}
                alt={sandwich.name}
                onError={(e: any) => {
                  e.target.src = 'https://via.placeholder.com/200x200';
                }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{sandwich.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpen(sandwich)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(sandwich.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {sandwich.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  ${sandwich.price.toFixed(2)}
                </Typography>
                <Rating value={sandwich.rating} readOnly precision={0.5} />
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {sandwich.ingredients.map((ingredient, index) => (
                    <Chip key={index} label={ingredient} size="small" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSandwich ? 'Edit Sandwich' : 'Add New Sandwich'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ingredients (comma-separated)"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  required
                  helperText="Enter ingredients separated by commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSandwich ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SandwichList; 