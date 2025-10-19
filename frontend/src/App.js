import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    CssBaseline,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Button,
    Box,
    Stack,
    Paper,
    Chip
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';
import {
    DirectionsCar,
    Storefront,
    ReceiptLong,
    Group,
    TrendingUp,
    AutoAwesome
} from '@mui/icons-material';
import CarsPage from './pages/CarPage';
import DealerPage from './pages/DealerPage';
import OrderPage from './pages/OrderPage';
import UserPage from './pages/UserPage';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1f4f8e'
        },
        secondary: {
            main: '#f97362'
        },
        background: {
            default: '#f6f8fc',
            paper: '#ffffff'
        },
        text: {
            primary: '#1f2933',
            secondary: '#52606d'
        }
    },
    typography: {
        fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
        h4: {
            fontWeight: 700
        },
        h6: {
            fontWeight: 600
        },
        button: {
            textTransform: 'none',
            fontWeight: 600
        }
    },
    shape: {
        borderRadius: 20
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 14
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 20
                }
            }
        }
    }
});

const navigationItems = [
    { label: 'Автомобили', to: '/cars', icon: <DirectionsCar fontSize="small" /> },
    { label: 'Автосалоны', to: '/dealers', icon: <Storefront fontSize="small" /> },
    { label: 'Заказы', to: '/orders', icon: <ReceiptLong fontSize="small" /> },
    { label: 'Клиенты', to: '/users', icon: <Group fontSize="small" /> }
];

const NavigationBar = () => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/cars') {
            return location.pathname === '/' || location.pathname.startsWith('/cars');
        }
        return location.pathname.startsWith(path);
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: 'transparent',
                color: 'text.primary',
                boxShadow: 'none'
            }}
        >
            <Toolbar
                disableGutters
                sx={(theme) => ({
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: { xs: 2.5, md: 3 },
                    py: { xs: 2, md: 2.5 },
                    borderRadius: { xs: 3, md: 4 },
                    backgroundColor: alpha(theme.palette.background.paper, 0.92),
                    boxShadow: theme.shadows[4],
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    backdropFilter: 'blur(18px)'
                })}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                    <Box
                        sx={(theme) => ({
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                            color: theme.palette.common.white,
                            boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.35)}`
                        })}
                    >
                        <DirectionsCar fontSize="medium" />
                    </Box>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                            Car Management System
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Управление автосалоном и клиентами
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                    {navigationItems.map((item) => (
                        <Button
                            key={item.to}
                            component={Link}
                            to={item.to}
                            startIcon={item.icon}
                            variant={isActive(item.to) ? 'contained' : 'text'}
                            color={isActive(item.to) ? 'primary' : 'inherit'}
                            sx={(theme) => ({
                                px: { xs: 1.75, md: 2 },
                                py: 1,
                                borderRadius: 999,
                                fontWeight: isActive(item.to) ? 700 : 500,
                                color: isActive(item.to) ? theme.palette.common.white : theme.palette.text.primary,
                                backgroundColor: isActive(item.to)
                                    ? theme.palette.primary.main
                                    : alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                    backgroundColor: isActive(item.to)
                                        ? theme.palette.primary.dark
                                        : alpha(theme.palette.primary.main, 0.16)
                                }
                            })}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

const AppLayout = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                py: { xs: 6, md: 8 },
                px: { xs: 2, md: 4 }
            }}
        >
            <Container maxWidth="lg" sx={{ px: { xs: 0, md: 2 } }}>
                <Stack spacing={4}>
                    <NavigationBar />

                    <Paper
                        elevation={0}
                        sx={(theme) => ({
                            p: { xs: 3, md: 4 },
                            background: `linear-gradient(130deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                            boxShadow: '0 20px 45px rgba(31, 79, 142, 0.12)'
                        })}
                    >
                        <Stack spacing={2}>
                            <Chip
                                icon={<AutoAwesome fontSize="small" />}
                                label="Добро пожаловать в Car Management System"
                                sx={(theme) => ({
                                    alignSelf: 'flex-start',
                                    fontWeight: 600,
                                    px: 1,
                                    backgroundColor: alpha(theme.palette.common.white, 0.65),
                                    color: theme.palette.primary.main
                                })}
                            />
                            <Typography variant="h4" sx={{ color: 'primary.main' }}>
                                Современная панель управления автосалоном
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
                                Анализируйте автопарк, управляйте заказами и контролируйте дилеров в едином пространстве.
                                Обновлённый интерфейс помогает быстрее находить нужную информацию и работать без отвлечений.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Chip
                                    icon={<TrendingUp fontSize="small" />}
                                    label="Живые показатели продаж"
                                    sx={(theme) => ({
                                        backgroundColor: alpha(theme.palette.primary.main, 0.14),
                                        color: theme.palette.primary.dark,
                                        fontWeight: 600
                                    })}
                                />
                                <Chip
                                    icon={<Group fontSize="small" />}
                                    label="Клиенты и дилеры под контролем"
                                    sx={(theme) => ({
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.16),
                                        color: theme.palette.secondary.dark,
                                        fontWeight: 600
                                    })}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={(theme) => ({
                            p: { xs: 2, md: 3 },
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                            boxShadow: theme.shadows[2],
                            backgroundColor: theme.palette.background.paper
                        })}
                    >
                        <Box sx={{ py: { xs: 1, md: 1.5 } }}>
                            <Routes>
                                <Route path="/cars" element={<CarsPage />} />
                                <Route path="/dealers" element={<DealerPage />} />
                                <Route path="/orders" element={<OrderPage />} />
                                <Route path="/users" element={<UserPage />} />
                                <Route path="/" element={<CarsPage />} />
                            </Routes>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppLayout />
            </Router>
        </ThemeProvider>
    );
}

export default App;
