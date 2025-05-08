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
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_id: number;
  items: {
    sandwichId: number;
    sandwichName: string;
    quantity: number;
    price: number;
  }[];
  total_amount: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  order_date: string;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sandwiches, setSandwiches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    items: [{ sandwichId: '', quantity: 1 }],
  });

  useEffect(() => {
    fetchOrders();
    fetchSandwiches();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleOpen = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        items: order.items.map(item => ({
          sandwichId: item.sandwichId.toString(),
          quantity: item.quantity,
        })),
      });
    } else {
      setEditingOrder(null);
      setFormData({
        customer_name: '',
        customer_email: '',
        items: [{ sandwichId: '', quantity: 1 }],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrder(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { sandwichId: '', quantity: 1 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        items: formData.items.map(item => ({
          sandwichId: parseInt(item.sandwichId),
          quantity: parseInt(item.quantity.toString()),
        })),
      };

      if (editingOrder) {
        await axios.put(`http://localhost:3001/api/orders/${editingOrder.id}`, orderData);
      } else {
        await axios.post('http://localhost:3001/api/orders', orderData);
      }

      fetchOrders();
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`http://localhost:3001/api/orders/${id}`);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const filteredOrders = orders.filter(order => 
    (order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Order
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search orders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Filter Status</InputLabel>
            <Select value={statusFilter} onChange={handleStatusFilterChange}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{order.customer_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customer_email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={1}>
                    {order.items.map((item, index) => (
                      <Typography key={index} variant="body2">
                        {item.quantity}x {item.sandwichName} (${item.price})
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>${order.total_amount}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      size="small"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="preparing">Preparing</MenuItem>
                      <MenuItem value="ready">Ready</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {new Date(order.order_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(order)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(order.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Order' : 'New Order'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                />
              </Grid>
              {formData.items.map((item, index) => (
                <Grid item xs={12} key={index} container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sandwich</InputLabel>
                      <Select
                        value={item.sandwichId}
                        onChange={(e) => handleItemChange(index, 'sandwichId', e.target.value)}
                        required
                      >
                        {sandwiches.map((sandwich) => (
                          <MenuItem key={sandwich.id} value={sandwich.id}>
                            {sandwich.name} (${sandwich.price})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      InputProps={{ inputProps: { min: 1 } }}
                      required
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => handleRemoveItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button onClick={handleAddItem} startIcon={<AddIcon />}>
                  Add Item
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOrder ? 'Update' : 'Create'} Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList; 