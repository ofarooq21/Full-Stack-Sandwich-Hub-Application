import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sandwich Maker
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/sandwiches"
          >
            Sandwiches
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/orders"
          >
            Orders
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/customers"
          >
            Customers
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/reviews"
          >
            Reviews
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 