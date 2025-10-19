import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Autocomplete,
    Paper,
    Stack,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert
} from '@mui/material';
import { Delete, Search, Add, Warning } from '@mui/icons-material';
import { createOrder, getAllCars, getAllUsers, getAllOrders } from '../services/api';

const OrderForm = ({ onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [allCars, setAllCars] = useState([]);
    const [orders, setOrders] = useState([]);
    const [availableCars, setAvailableCars] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCars, setSelectedCars] = useState([]);
    const [carSearchInput, setCarSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [carToRemove, setCarToRemove] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, carsRes, ordersRes] = await Promise.all([
                    getAllUsers(),
                    getAllCars(),
                    getAllOrders()
                ]);
                setUsers(usersRes.data);
                setAllCars(carsRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error("Ошибка загрузки данных", err);
            }
        };
        fetchData();
    }, []);

    const getOrderedCarIds = () => {
        const orderedCarIds = new Set();
        orders.forEach(order => {
            order.carIds.forEach(carId => orderedCarIds.add(carId));
        });
        return orderedCarIds;
    };

    useEffect(() => {
        const orderedCarIds = getOrderedCarIds();
        const available = allCars.filter(car =>
            !orderedCarIds.has(car.id) &&
            !selectedCars.some(selected => selected.id === car.id)
        );
        setAvailableCars(available);
    }, [allCars, orders, selectedCars]);

    const validateForm = () => {
        const newErrors = {};

        // Валидация клиента
        if (!selectedUser) {
            newErrors.user = "Выберите клиента";
        }

        // Валидация автомобилей
        if (selectedCars.length === 0) {
            newErrors.cars = "Выберите хотя бы один автомобиль";
        } else if (selectedCars.length > 10) {
            newErrors.cars = "Максимум 10 автомобилей в заказе";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

// Обновим функцию handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await createOrder({
                userId: selectedUser.id,
                carIds: selectedCars.map(car => car.id)
            });
            onSuccess();
            setSelectedUser(null);
            setSelectedCars([]);
        } catch (err) {
            console.error("Ошибка создания заказа", err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotal = () => selectedCars.reduce((sum, car) => sum + car.price, 0);

    const addCar = (car) => {
        setSelectedCars(prev => [...prev, car]);
        setCarSearchInput('');
    };

    const openRemoveConfirm = (carId) => {
        setCarToRemove(carId);
        setConfirmDialogOpen(true);
    };

    const handleRemoveCar = () => {
        setSelectedCars(prev => prev.filter(car => car.id !== carToRemove));
        setConfirmDialogOpen(false);
        setCarToRemove(null);
    };

    const handleCancelRemove = () => {
        setConfirmDialogOpen(false);
        setCarToRemove(null);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Создание нового заказа
            </Typography>

            {/* Выбор клиента */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Информация о клиенте
                </Typography>
                <Autocomplete
                    options={users}
                    getOptionLabel={(user) => user.username}
                    value={selectedUser}
                    onChange={(e, newValue) => setSelectedUser(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Выберите клиента"
                            error={!!errors.user}
                            helperText={errors.user || "Выберите клиента для этого заказа"}
                            fullWidth
                        />
                    )}
                    noOptionsText="Клиенты не найдены"
                />
            </Paper>

            {/* Выбор автомобилей */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Добавление автомобилей в заказ
                </Typography>
                <Autocomplete
                    options={availableCars}
                    getOptionLabel={(car) => `${car.brand} ${car.model} (${car.year}) - ${car.price.toLocaleString()} $`}
                    inputValue={carSearchInput}
                    onInputChange={(e, newInputValue) => setCarSearchInput(newInputValue)}
                    onChange={(e, newValue) => newValue && addCar(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Поиск автомобилей по марке, модели, году или VIN"
                            error={!!errors.cars}
                            helperText={errors.cars || "Начните вводить для поиска доступных автомобилей"}
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, car) => (
                        <li {...props} key={car.id}>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle1">
                                    {car.brand} {car.model}
                                </Typography>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2">
                                        {car.year} | VIN: {car.vin}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {car.price.toLocaleString()} $
                                    </Typography>
                                </Stack>
                            </Box>
                        </li>
                    )}
                    noOptionsText="Совпадений не найдено"
                />
            </Paper>

            {/* Выбранные автомобили */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Выбранные автомобили ({selectedCars.length})
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Итого: {calculateTotal().toLocaleString()} $
                    </Typography>
                </Stack>

                {selectedCars.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed #ddd', borderRadius: 1 }}>
                        <Typography color="text.secondary">
                            Автомобили не выбраны
                        </Typography>
                    </Box>
                ) : (
                    <List dense>
                        {Array.from(new Set(selectedCars.map(car => car.id))).map(carId => {
                            const car = selectedCars.find(c => c.id === carId);
                            const count = selectedCars.filter(c => c.id === carId).length;
                            return (
                                <ListItem key={carId} divider>
                                    <ListItemText
                                        primary={`${car.brand} ${car.model} (${car.year})`}
                                        secondary={`VIN: ${car.vin} | Цена: ${car.price.toLocaleString()} $ × ${count}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => openRemoveConfirm(carId)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Paper>

            {/* Кнопка создания заказа */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Add />}
                    disabled={isLoading || selectedCars.length === 0 || !selectedUser}
                    sx={{ minWidth: 200 }}
                >
                    {isLoading ? 'Создание...' : 'Создать заказ'}
                </Button>
            </Box>

            {/* Диалог подтверждения удаления */}
            <Dialog open={confirmDialogOpen} onClose={handleCancelRemove}>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Warning color="warning" />
                        <span>Подтверждение удаления</span>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы действительно хотите удалить автомобиль из заказа?
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
                        <Typography variant="body2">
                            Это действие нельзя отменить. Автомобиль будет доступен для новых заказов.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelRemove}>Отмена</Button>
                    <Button
                        onClick={handleRemoveCar}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderForm;