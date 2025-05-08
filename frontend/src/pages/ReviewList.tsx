import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Rating,
  Avatar,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Review {
  id: number;
  customer_id: number;
  sandwich_id: number;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  customer_name: string;
  sandwich_name: string;
}

const ReviewList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sandwiches, setSandwiches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    customer_id: '',
    sandwich_id: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
    fetchSandwiches();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSandwiches = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sandwiches');
      setSandwiches(response.data);
    } catch (error) {
      console.error('Error fetching sandwiches:', error);
    }
  };

  const handleOpen = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        customer_id: review.customer_id.toString(),
        sandwich_id: review.sandwich_id.toString(),
        rating: review.rating,
        comment: review.comment,
      });
    } else {
      setEditingReview(null);
      setFormData({
        customer_id: '',
        sandwich_id: '',
        rating: 5,
        comment: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingReview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        sandwich_id: parseInt(formData.sandwich_id),
      };

      if (editingReview) {
        await axios.put(`http://localhost:3001/api/reviews/${editingReview.id}`, submitData);
      } else {
        await axios.post('http://localhost:3001/api/reviews', submitData);
      }

      fetchReviews();
      handleClose();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`http://localhost:3001/api/reviews/${id}`);
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleStatusChange = async (reviewId: number, newStatus: Review['status']) => {
    try {
      await axios.patch(`http://localhost:3001/api/reviews/${reviewId}/status`, { status: newStatus });
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleRatingFilterChange = (event: SelectChangeEvent) => {
    setRatingFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const filteredReviews = reviews.filter(review => 
    (review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     review.sandwich_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     review.comment.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (ratingFilter === 'all' || review.rating === parseInt(ratingFilter)) &&
    (statusFilter === 'all' || review.status === statusFilter)
  );

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Reviews</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Review
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search reviews"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Rating</InputLabel>
            <Select value={ratingFilter} onChange={handleRatingFilterChange}>
              <MenuItem value="all">All Ratings</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4 Stars</MenuItem>
              <MenuItem value="3">3 Stars</MenuItem>
              <MenuItem value="2">2 Stars</MenuItem>
              <MenuItem value="1">1 Star</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} onChange={handleStatusFilterChange}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredReviews.map((review) => (
          <Grid item xs={12} md={6} key={review.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{review.customer_name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{review.customer_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.sandwich_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleOpen(review)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(review.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly precision={0.5} sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={review.status}
                    color={getStatusColor(review.status)}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReview ? 'Edit Review' : 'Add New Review'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    {reviews.map((review) => (
                      <MenuItem key={review.customer_id} value={review.customer_id}>
                        {review.customer_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sandwich</InputLabel>
                  <Select
                    value={formData.sandwich_id}
                    onChange={(e) => setFormData({ ...formData, sandwich_id: e.target.value })}
                    required
                  >
                    {sandwiches.map((sandwich) => (
                      <MenuItem key={sandwich.id} value={sandwich.id}>
                        {sandwich.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  value={formData.rating}
                  onChange={(_, value) => setFormData({ ...formData, rating: value || 0 })}
                  precision={0.5}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingReview ? 'Save Changes' : 'Add Review'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReviewList; 