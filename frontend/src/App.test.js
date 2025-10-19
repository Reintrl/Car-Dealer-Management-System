import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/CarPage', () => () => <div>Cars page</div>);
jest.mock('./pages/DealerPage', () => () => <div>Dealers page</div>);
jest.mock('./pages/OrderPage', () => () => <div>Orders page</div>);
jest.mock('./pages/UserPage', () => () => <div>Users page</div>);

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        BrowserRouter: ({ children }) => <div>{children}</div>,
        Routes: ({ children }) => <>{children}</>,
        Route: ({ element }) => <>{element}</>,
        Link: React.forwardRef(({ children }, ref) => (
            <span ref={ref}>{children}</span>
        )),
        useLocation: () => ({ pathname: '/cars' })
    };
}, { virtual: true });

describe('App layout', () => {
    it('renders updated branding and hero content', () => {
        render(<App />);

        expect(screen.getByText('Dealer HQ')).toBeInTheDocument();
        expect(
            screen.getByText('Современная панель управления автосалоном')
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Анализируйте автопарк, управляйте заказами/i)
        ).toBeInTheDocument();
    });
});
