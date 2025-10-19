import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#FF6F61',       // коралловый
            light: '#FF8A75',
            dark: '#E05245',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#FFA726',       // оранжевый/персиковый
            light: '#FFCC80',
            dark: '#FB8C00',
            contrastText: '#212121',
        },
        background: {
            default: '#FFF8F5',    // светлый персиковый фон
            paper: '#FFFFFF',
        },
        text: {
            primary: '#3E2723',    // тёмно-коричневый
            secondary: '#6D4C41',
        },
        info: {
            main: '#FFE0B2',       // кремовый
            contrastText: '#5D4037',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '3rem',
            color: '#3E2723',
        },
        h2: {
            fontWeight: 600,
            color: '#5D4037',
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FF6F61',
                    boxShadow: 'none',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 22px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                },
                containedPrimary: {
                    backgroundColor: '#FF6F61',
                    '&:hover': {
                        backgroundColor: '#E05245',
                    },
                },
                containedSecondary: {
                    backgroundColor: '#FFA726',
                    '&:hover': {
                        backgroundColor: '#FB8C00',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                    transition: '0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 28px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    },
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);