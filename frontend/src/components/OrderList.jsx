import React, { useEffect, useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TableSortLabel, Box, Typography, Stack, Chip, IconButton,
    TextField, InputAdornment
} from '@mui/material';
import { Add, Delete, Search, Clear } from '@mui/icons-material';
import { getAllOrders, deleteOrder, getAllUsers, getAllCars, createOrder } from '../services/api';
import OrderForm from './OrderForm';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: 'orderDate',
        direction: 'desc'
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const [ordersRes, usersRes, carsRes] = await Promise.all([
                getAllOrders(),
                getAllUsers(),
                getAllCars()
            ]);
            setOrders(ordersRes.data);
            setFilteredOrders(ordersRes.data);
            setUsers(usersRes.data);
            setCars(carsRes.data);
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredOrders(orders);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = orders.filter(order => {
            const user = users.find(u => u.id === order.userId);
            const userName = user?.username?.toLowerCase() || '';
            const userEmail = user?.email?.toLowerCase() || '';

            const carDetails = order.carIds
                .map(carId => {
                    const car = cars.find(c => c.id === carId);
                    return car ? `${car.brand} ${car.model}`.toLowerCase() : '';
                })
                .join(' ');

            const orderDate = formatDate(order.orderDate)?.toLowerCase() || '';
            const totalPrice = order.totalPrice?.toString() || '';

            return (
                userName.includes(term) ||
                userEmail.includes(term) ||
                carDetails.includes(term) ||
                totalPrice.includes(term) ||
                orderDate.includes(term)
            );
        });
        setFilteredOrders(filtered);
    }, [searchTerm, orders, users, cars]);

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            if (sortConfig.key === 'orderDate') {
                const dateA = new Date(a.orderDate);
                const dateB = new Date(b.orderDate);
                return sortConfig.direction === 'asc'
                    ? dateA - dateB
                    : dateB - dateA;
            }
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredOrders, sortConfig]);

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : `ID: ${userId}`;
    };

    const getCarDetails = (carId) => {
        const car = cars.find(c => c.id === carId);
        return car ? `${car.brand} ${car.model}` : `ID: ${carId}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCreateOrder = async (orderData) => {
        try {
            await createOrder(orderData);
            await fetchData();
            setOpenCreateDialog(false);
        } catch (err) {
            console.error('Ошибка создания заказа:', err);
        }
    };

    const handleDeleteOrder = async () => {
        try {
            await deleteOrder(orderToDelete.id);
            await fetchData();
            setDeleteDialogOpen(false);
        } catch (err) {
            console.error('Ошибка удаления заказа:', err);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                p: 1,
                backgroundColor: 'background.paper',
                borderRadius: 1
            }}>
                <Typography variant="h5" component="h2">
                    Список заказов
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setOpenCreateDialog(true)}
                    sx={{ minWidth: 180 }}
                >
                    Создать заказ
                </Button>
            </Box>

            {/* Панель поиска */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по клиенту, автомобилям, сумме или дате..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <IconButton
                                size="small"
                                onClick={clearSearch}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        )
                    }}
                />
            </Box>

            {/* Информация о результатах */}
            {searchTerm && (
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                        Найдено: {filteredOrders.length} из {orders.length}
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<Clear />}
                        onClick={clearSearch}
                    >
                        Сбросить поиск
                    </Button>
                </Box>
            )}

            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 'calc(100vh - 250px)',
                    minWidth: '100%',
                }}
            >
                <Table stickyHeader sx={{ width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'orderDate'}
                                    direction={sortConfig.key === 'orderDate' ? sortConfig.direction : 'desc'}
                                    onClick={() => handleSort('orderDate')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Дата заказа</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Клиент</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Автомобили</Typography>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'totalPrice'}
                                    direction={sortConfig.key === 'totalPrice' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('totalPrice')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Сумма</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Действия</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedOrders.length > 0 ? (
                            sortedOrders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                                    <TableCell>{getUserName(order.userId)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                            {order.carIds.slice(0, 3).map(carId => (
                                                <Chip
                                                    key={carId}
                                                    label={getCarDetails(carId)}
                                                    size="small"
                                                />
                                            ))}
                                            {order.carIds.length > 3 && (
                                                <Chip
                                                    label={`+${order.carIds.length - 3}`}
                                                    size="small"
                                                    color="info"
                                                />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{order.totalPrice.toLocaleString()} $</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                setOrderToDelete(order);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {orders.length === 0 ? 'Нет данных о заказах' : 'Ничего не найдено'}
                                    </Typography>
                                    {searchTerm && (
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={clearSearch}
                                            sx={{ mt: 1 }}
                                        >
                                            Сбросить поиск
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог создания заказа */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogContent>
                    <OrderForm
                        onSuccess={() => {
                            fetchData();
                            setOpenCreateDialog(false);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Отмена</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Вы действительно хотите удалить этот заказ?
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
                        <Typography variant="body2">
                            <strong>Дата:</strong> {orderToDelete && formatDate(orderToDelete.orderDate)}<br />
                            <strong>Клиент:</strong> {orderToDelete && getUserName(orderToDelete.userId)}<br />
                            <strong>Сумма:</strong> {orderToDelete?.totalPrice.toLocaleString()} $<br />
                            <strong>Автомобилей:</strong> {orderToDelete?.carIds.length}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleDeleteOrder}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OrderList;