import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TableSortLabel, Box, Typography, Stack, Chip, Avatar, Tooltip,
    ListItemText, ListItem, IconButton, List, TextField, InputAdornment,
    MenuItem, FormControl, Select, Grid
} from '@mui/material';
import { getAllCars, deleteCar, getAllDealers, getAllUsers } from '../services/api';
import { Add, Edit, Delete, Favorite, Search, Clear } from '@mui/icons-material';
import CarForm from './CarForm';

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'brand',
        direction: 'asc',
    });
    const [carToDelete, setCarToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
    const [currentFavorites, setCurrentFavorites] = useState([]);

    // Состояния для поиска и фильтрации
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        dealerId: '',
        hasOrder: 'all'
    });

    const fetchData = async () => {
        try {
            const [carsRes, dealersRes, usersRes] = await Promise.all([
                getAllCars(),
                getAllDealers(),
                getAllUsers()
            ]);
            setCars(carsRes.data);
            setFilteredCars(carsRes.data);
            setDealers(dealersRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Эффект для применения фильтров и поиска
    useEffect(() => {
        let result = [...cars];

        // Применяем поиск
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(car =>
                car.brand.toLowerCase().includes(term) ||
                car.model.toLowerCase().includes(term) ||
                car.vin.toLowerCase().includes(term) ||
                car.color.toLowerCase().includes(term))
        }

        // Фильтр по автосалону
        if (filters.dealerId) {
            result = result.filter(car => car.dealerId === Number(filters.dealerId));
        }

        // Фильтр по наличию заказа
        if (filters.hasOrder !== 'all') {
            const hasOrder = filters.hasOrder === 'yes';
            result = result.filter(car =>
                hasOrder ? car.orderId !== null : car.orderId === null);
        }

        setFilteredCars(result);
    }, [cars, searchTerm, filters]);

    // Проверяем, применены ли какие-либо фильтры
    const filtersApplied = searchTerm || filters.dealerId || filters.hasOrder !== 'all';

    // Остальные функции остаются без изменений
    const getDealerName = (dealerId) => {
        const dealer = dealers.find(d => d.id === dealerId);
        return dealer ? dealer.name : `ID: ${dealerId}`;
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username : `ID: ${userId}`;
    };

    const handleDialogOpen = (car = null) => {
        setSelectedCar(car);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedCar(null);
    };

    const openDeleteDialog = (car) => {
        setCarToDelete(car);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteCar(carToDelete.id);
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteDialogOpen(false);
            setCarToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setCarToDelete(null);
    };

    const showFavorites = (userIds) => {
        setCurrentFavorites(userIds || []);
        setFavoritesDialogOpen(true);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            dealerId: '',
            hasOrder: 'all'
        });
    };

    const sortedCars = [...filteredCars].sort((a, b) => {
        if (sortConfig.key === 'dealer') {
            const aDealer = getDealerName(a.dealerId);
            const bDealer = getDealerName(b.dealerId);
            return sortConfig.direction === 'asc'
                ? aDealer.localeCompare(bDealer)
                : bDealer.localeCompare(aDealer);
        }

        if (['year', 'price', 'mileage'].includes(sortConfig.key)) {
            const aValue = a[sortConfig.key] || 0;
            const bValue = b[sortConfig.key] || 0;
            return sortConfig.direction === 'asc'
                ? aValue - bValue
                : bValue - aValue;
        }

        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

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
                    Список автомобилей
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => handleDialogOpen()}
                    sx={{ minWidth: 180 }}
                >
                    Добавить авто
                </Button>
            </Box>

            {/* Панель поиска и фильтров */}
            <Box sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                {/* Поиск */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по марке, модели, VIN..."
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
                                onClick={() => setSearchTerm('')}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        ),
                        sx: { height: 56 } // Высота как у других полей
                    }}
                    sx={{ flex: 2 }}
                />

                {/* Фильтр по автосалону */}
                <FormControl fullWidth sx={{ flex: 1 }}>
                    <Select
                        value={filters.dealerId}
                        onChange={handleFilterChange}
                        name="dealerId"
                        displayEmpty
                        variant="outlined"
                        sx={{ height: 56 }} // Высота как у других полей
                    >
                        <MenuItem value="">Все автосалоны</MenuItem>
                        {dealers.map(dealer => (
                            <MenuItem key={dealer.id} value={dealer.id}>
                                {dealer.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Фильтр по наличию заказа */}
                <FormControl fullWidth sx={{ flex: 1 }}>
                    <Select
                        value={filters.hasOrder}
                        onChange={handleFilterChange}
                        name="hasOrder"
                        variant="outlined"
                        sx={{ height: 56 }} // Высота как у других полей
                    >
                        <MenuItem value="all">Все автомобили</MenuItem>
                        <MenuItem value="yes">В заказе</MenuItem>
                        <MenuItem value="no">Без заказа</MenuItem>
                    </Select>
                </FormControl>

                {/* Кнопка сброса фильтров */}
                <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={resetFilters}
                    disabled={!filtersApplied}
                    sx={{
                        height: 56, // Такая же высота как у полей
                        minWidth: 120,
                        flexShrink: 0
                    }}
                >
                    Сбросить
                </Button>
            </Box>

            {/* Информация о результатах */}
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Найдено: {filteredCars.length} из {cars.length}
                </Typography>
                {filtersApplied && (
                    <Chip
                        label="Фильтры применены"
                        icon={<Clear fontSize="small" />}
                        size="small"
                        color="info"
                        variant="outlined"
                    />
                )}
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 'calc(100vh - 350px)',
                    minWidth: '100%',
                }}
            >
                <Table stickyHeader sx={{ width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'brand'}
                                    direction={sortConfig.key === 'brand' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('brand')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Марка</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'model'}
                                    direction={sortConfig.key === 'model' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('model')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Модель</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'year'}
                                    direction={sortConfig.key === 'year' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('year')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Год</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'price'}
                                    direction={sortConfig.key === 'price' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('price')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Цена ($)</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Цвет</Typography>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'mileage'}
                                    direction={sortConfig.key === 'mileage' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('mileage')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Пробег (км)</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">VIN</Typography>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'dealer'}
                                    direction={sortConfig.key === 'dealer' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('dealer')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Автосалон</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Заказ</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Действия</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCars.map((car) => (
                            <TableRow key={car.id} hover>
                                <TableCell>{car.brand}</TableCell>
                                <TableCell>{car.model}</TableCell>
                                <TableCell>{car.year}</TableCell>
                                <TableCell>${car.price.toLocaleString()}</TableCell>
                                <TableCell>{car.color}</TableCell>
                                <TableCell>{car.mileage.toLocaleString()}</TableCell>
                                <TableCell>{car.vin}</TableCell>
                                <TableCell>{getDealerName(car.dealerId)}</TableCell>
                                <TableCell>
                                    {car.orderId ? (
                                        <Chip
                                            label={`#${car.orderId}`}
                                            size="small"
                                            color="primary"
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Нет заказа
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        {car.userIdsWhoFavorited?.length > 0 && (
                                            <Tooltip title="Показать избранное">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => showFavorites(car.userIdsWhoFavorited)}
                                                    color="secondary"
                                                >
                                                    <Favorite fontSize="small" />
                                                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                                                        {car.userIdsWhoFavorited.length}
                                                    </Typography>
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => handleDialogOpen(car)}
                                            sx={{ minWidth: 0, px: 1 }}
                                        >
                                            <Edit fontSize="small" />
                                        </Button>
                                        <Button
                                            variant="text"
                                            color="error"
                                            size="small"
                                            onClick={() => openDeleteDialog(car)}
                                            sx={{ minWidth: 0, px: 1 }}
                                        >
                                            <Delete fontSize="small" />
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Диалог для добавления/редактирования */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <CarForm
                        initialData={selectedCar}
                        onSuccess={() => {
                            fetchData();
                            handleDialogClose();
                        }}
                        isInOrder={selectedCar?.orderId !== null}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Закрыть</Button>
                </DialogActions>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы действительно хотите удалить автомобиль <strong>{carToDelete?.brand} {carToDelete?.model}</strong>?
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            VIN: {carToDelete?.vin}<br />
                            Год: {carToDelete?.year}<br />
                            Автосалон: {getDealerName(carToDelete?.dealerId)}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCancelDelete}
                        variant="outlined"
                        sx={{ minWidth: 120 }}
                    >
                        Отменить
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        sx={{ minWidth: 120 }}
                        autoFocus
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог списка избранного */}
            <Dialog open={favoritesDialogOpen} onClose={() => setFavoritesDialogOpen(false)}>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Favorite color="secondary" />
                        <span>Пользователи добавили в избранное</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {currentFavorites.length > 0 ? (
                            currentFavorites.map(userId => (
                                <ListItem key={userId}>
                                    <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                                        {getUserName(userId).charAt(0)}
                                    </Avatar>
                                    <ListItemText primary={getUserName(userId)} />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Нет пользователей, добавивших в избранное
                            </Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFavoritesDialogOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CarList;