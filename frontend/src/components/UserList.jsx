import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TableSortLabel, Box, Typography, Stack, Chip, IconButton, Avatar,
    Tooltip, List, ListItem, ListItemText, ListItemSecondaryAction, Divider,
    TextField, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Favorite, DirectionsCar, Search, Clear } from '@mui/icons-material';
import { getAllUsers, deleteUser, getAllCars, getAllOrders } from '../services/api';
import UserForm from './UserForm';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [cars, setCars] = useState([]);
    const [orders, setOrders] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'username',
        direction: 'asc'
    });
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
    const [currentFavorites, setCurrentFavorites] = useState([]);
    const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const [usersRes, carsRes, ordersRes] = await Promise.all([
                getAllUsers(),
                getAllCars(),
                getAllOrders()
            ]);
            setUsers(usersRes.data);
            setFilteredUsers(usersRes.data);
            setCars(carsRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredUsers(users);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(term) ||
            (user.favoriteCarIds && user.favoriteCarIds.some(carId => {
                const car = cars.find(c => c.id === carId);
                return car && (
                    car.brand.toLowerCase().includes(term) ||
                    car.model.toLowerCase().includes(term) ||
                    car.vin.toLowerCase().includes(term)
                );
            })) ||
            (user.orderIds && user.orderIds.some(orderId => {
                const order = orders.find(o => o.id === orderId);
                return order && order.totalPrice.toString().includes(term);
            }))
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users, cars, orders]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getCarDetails = (carId) => {
        const car = cars.find(c => c.id === carId);
        if (!car) return null;
        return {
            brand: car.brand,
            model: car.model,
            year: car.year,
            vin: car.vin,
            price: car.price,
            color: car.color,
            mileage: car.mileage,
            dealerId: car.dealerId
        };
    };

    const getOrderDetails = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;
        return {
            date: order.orderDate,
            totalPrice: order.totalPrice,
            carIds: order.carIds
        };
    };

    const handleDialogOpen = (user = null) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const openDeleteDialog = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteUser(userToDelete.id);
            fetchData();
        } catch (err) {
            console.error("Ошибка удаления:", err);
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const showFavorites = (favoriteCarIds) => {
        const favoritesWithDetails = favoriteCarIds
            .map(carId => getCarDetails(carId))
            .filter(Boolean);
        setCurrentFavorites(favoritesWithDetails);
        setFavoritesDialogOpen(true);
    };

    const showOrders = (orderIds) => {
        const ordersWithDetails = orderIds
            .map(orderId => getOrderDetails(orderId))
            .filter(Boolean);
        setUserOrders(ordersWithDetails);
        setOrdersDialogOpen(true);
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
                    Список пользователей
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => handleDialogOpen()}
                    sx={{ minWidth: 180 }}
                >
                    Добавить пользователя
                </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по имени или автомобилям..."
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

            {searchTerm && (
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                        Найдено: {filteredUsers.length} из {users.length}
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
                                    active={sortConfig.key === 'username'}
                                    direction={sortConfig.key === 'username' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('username')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Имя пользователя</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Избранные авто</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Заказы</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Действия</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.length > 0 ? (
                            sortedUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Avatar sx={{ width: 32, height: 32 }}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography>{user.username}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {user.favoriteCarIds?.length > 0 ? (
                                            <Tooltip title="Показать избранное">
                                                <Chip
                                                    icon={<Favorite fontSize="small" />}
                                                    label={`${user.favoriteCarIds.length} авто`}
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => showFavorites(user.favoriteCarIds)}
                                                    clickable
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Нет избранных
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.orderIds?.length > 0 ? (
                                            <Tooltip title="Показать заказы">
                                                <Chip
                                                    label={`${user.orderIds.length} заказов`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    onClick={() => showOrders(user.orderIds)}
                                                    clickable
                                                />
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Нет заказов
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleDialogOpen(user)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteDialog(user)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {users.length === 0 ? 'Нет данных о пользователях' : 'Ничего не найдено'}
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

            {/* Остальные диалоги остаются без изменений */}
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <UserForm
                        initialData={selectedUser}
                        onSuccess={() => {
                            fetchData();
                            handleDialogClose();
                        }}
                        cars={cars}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Вы действительно хотите удалить пользователя <strong>{userToDelete?.username}</strong>?
                    </Typography>
                    {userToDelete && (userToDelete.orderIds?.length > 0 || userToDelete.favoriteCarIds?.length > 0) && (
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: '#fff8e1',
                            borderRadius: 1
                        }}>
                            <Typography variant="body2" color="error">
                                <strong>Внимание:</strong> У пользователя есть:
                                {userToDelete.orderIds?.length > 0 && ` ${userToDelete.orderIds.length} заказов`}
                                {userToDelete.favoriteCarIds?.length > 0 && ` ${userToDelete.favoriteCarIds.length} избранных авто`}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCancelDelete}
                        variant="outlined"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={favoritesDialogOpen}
                onClose={() => setFavoritesDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Favorite color="secondary" />
                        <span>Избранные автомобили</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {currentFavorites.length > 0 ? (
                            currentFavorites.map((car, index) => (
                                <React.Fragment key={car.vin}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`${car.brand} ${car.model} (${car.year})`}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" display="block">
                                                        VIN: {car.vin}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" display="block">
                                                        Цвет: {car.color} | Пробег: {car.mileage} км
                                                    </Typography>
                                                    <Typography component="span" variant="body2" display="block">
                                                        Цена: {car.price.toLocaleString()} $
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < currentFavorites.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Нет избранных автомобилей
                            </Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFavoritesDialogOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={ordersDialogOpen}
                onClose={() => setOrdersDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DirectionsCar color="primary" />
                        <span>История заказов</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {userOrders.length > 0 ? (
                            userOrders.map((order, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`Заказ от ${formatDate(order.date)}`}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" display="block">
                                                        Сумма: {order.totalPrice.toLocaleString()} $
                                                    </Typography>
                                                    <Typography component="span" variant="body2" display="block">
                                                        Автомобили: {order.carIds.length} шт.
                                                    </Typography>
                                                    <Box component="div" sx={{ mt: 1 }}>
                                                        {order.carIds.map(carId => {
                                                            const car = getCarDetails(carId);
                                                            return car ? (
                                                                <Chip
                                                                    key={carId}
                                                                    label={`${car.brand} ${car.model}`}
                                                                    size="small"
                                                                    sx={{ mr: 1, mb: 1 }}
                                                                />
                                                            ) : null;
                                                        })}
                                                    </Box>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < userOrders.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Нет заказов
                            </Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOrdersDialogOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserList;