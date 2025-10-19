import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CssBaseline, Container, Typography, AppBar, Toolbar, Button } from '@mui/material';
import CarsPage from './pages/CarPage';
import DealerPage from './pages/DealerPage';
import OrderPage from './pages/OrderPage';
import UserPage from './pages/UserPage';

function App() {
    return (
        <Router>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Car Dealer Management
                    </Typography>
                    <Button color="inherit" component={Link} to="/cars">Cars</Button>
                    <Button color="inherit" component={Link} to="/dealers">Dealers</Button>
                    <Button color="inherit" component={Link} to="/orders">Orders</Button>
                    <Button color="inherit" component={Link} to="/users">Users</Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Routes>
                    <Route path="/cars" element={<CarsPage />} />
                    <Route path="/dealers" element={<DealerPage />} />
                    <Route path="/orders" element={<OrderPage />} />
                    <Route path="/users" element={<UserPage />} />
                    <Route path="/" element={<CarsPage />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;