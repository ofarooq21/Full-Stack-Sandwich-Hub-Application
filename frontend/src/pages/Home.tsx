import { Grid, Paper, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';

const Home = () => {
  const menuItems = [
    {
      title: 'Sandwiches',
      description: 'Manage sandwich menu and recipes',
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      path: '/sandwiches',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      path: '/orders',
    },
    {
      title: 'Customers',
      description: 'Manage customer information',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/customers',
    },
    {
      title: 'Reviews',
      description: 'View customer reviews and ratings',
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      path: '/reviews',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Sandwich Maker
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage your sandwich shop operations efficiently
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper
              component={RouterLink}
              to={item.path}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {item.icon}
              <Typography variant="h6" sx={{ mt: 2 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 