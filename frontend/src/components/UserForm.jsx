import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Autocomplete,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Avatar,
    InputAdornment,
    Paper,
    Alert, Stack
} from '@mui/material';
import { Delete, DirectionsCar, Search, Save } from '@mui/icons-material';
import { createUser, updateUser, addFavoriteCar, removeFavoriteCar } from '../services/api';

const UserForm = ({ initialData = null, onSuccess, cars = [], dealers = [] }) => {
    const [userData, setUserData] = useState({
        username: '',
        favoriteCarIds: [],
    });

    const [availableCars, setAvailableCars] = useState([]);
    const [carSearchInput, setCarSearchInput] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
    const [tempFavorites, setTempFavorites] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (initialData) {
            setUserData({
                username: initialData.username || '',
                favoriteCarIds: initialData.favoriteCarIds || [],
            });
        }
    }, [initialData]);

    useEffect(() => {
        const available = cars.filter(
            car => !(initialData ? userData.favoriteCarIds : tempFavorites).includes(car.id)
        );
        setAvailableCars(available);
    }, [cars, userData.favoriteCarIds, tempFavorites, initialData]);

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (!value) return "Обязательное поле";
                if (value.length < 3 || value.length > 20) return "3-20 символов";
                if (!/^\w+$/.test(value)) return "Только буквы, цифры и подчеркивания";
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(userData).forEach(key => {
            if (key === 'username') {
                const error = validateField(key, userData[key]);
                if (error) newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrorMessage('');

        try {
            if (initialData) {
                await updateUser(initialData.id, {
                    username: userData.username
                });
            } else {
                const response = await createUser({
                    username: userData.username
                });

                if (tempFavorites.length > 0) {
                    await Promise.all(
                        tempFavorites.map(carId =>
                            addFavoriteCar(response.data.id, carId)
                        )
                    );
                }
            }
            onSuccess();
        } catch (err) {
            console.error("Ошибка сохранения", err);
            setErrorMessage(err.response?.data?.message || "Произошла ошибка при сохранении");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFavorite = (carId) => {
        if (initialData) {
            setIsFavoriteLoading(true);
            addFavoriteCar(initialData.id, carId)
                .then(() => {
                    setUserData(prev => ({
                        ...prev,
                        favoriteCarIds: [...prev.favoriteCarIds, carId]
                    }));
                })
                .catch(err => {
                    console.error("Ошибка добавления в избранное", err);
                    setErrorMessage(err.response?.data?.message || "Ошибка добавления авто");
                })
                .finally(() => setIsFavoriteLoading(false));
        } else {
            setTempFavorites(prev => [...prev, carId]);
        }
    };

    const handleRemoveFavorite = (carId) => {
        if (initialData) {
            setIsFavoriteLoading(true);
            removeFavoriteCar(initialData.id, carId)
                .then(() => {
                    setUserData(prev => ({
                        ...prev,
                        favoriteCarIds: prev.favoriteCarIds.filter(id => id !== carId)
                    }));
                })
                .catch(err => {
                    console.error("Ошибка удаления из избранного", err);
                    setErrorMessage(err.response?.data?.message || "Ошибка удаления авто");
                })
                .finally(() => setIsFavoriteLoading(false));
        } else {
            setTempFavorites(prev => prev.filter(id => id !== carId));
        }
    };

    const getCarDetails = (carId) => {
        const car = cars.find(c => c.id === carId);
        if (!car) return null;
        const dealer = dealers.find(d => d.id === car.dealerId);
        return {
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            vin: car.vin,
            price: car.price,
            color: car.color,
            mileage: car.mileage,
            dealer: dealer ? dealer.name : 'Неизвестный автосалон'
        };
    };

    const currentFavorites = initialData ? userData.favoriteCarIds : tempFavorites;
    const favoritesWithDetails = currentFavorites
        .map(carId => getCarDetails(carId))
        .filter(Boolean);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {initialData ? 'Редактирование пользователя' : 'Добавление пользователя'}
                </Typography>

                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errorMessage}
                    </Alert>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Основная информация
                </Typography>

                <TextField
                    label="Имя пользователя *"
                    variant="outlined"
                    fullWidth
                    required
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username || "Только буквы, цифры и подчеркивания"}
                    sx={{ mb: 3 }}
                    disabled={!!initialData}
                />

                <Typography variant="h6" gutterBottom>
                    Избранные автомобили
                </Typography>

                <Autocomplete
                    options={availableCars}
                    getOptionLabel={(car) => `${car.brand} ${car.model} (${car.year}) - ${car.vin}`}
                    inputValue={carSearchInput}
                    onInputChange={(e, newInputValue) => setCarSearchInput(newInputValue)}
                    onChange={(e, newValue) => {
                        if (newValue) {
                            handleAddFavorite(newValue.id);
                            setCarSearchInput('');
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Добавить автомобиль"
                            fullWidth
                            helperText="Поиск по марке, модели или VIN"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />
                    )}
                    noOptionsText="Автомобили не найдены"
                    disabled={isFavoriteLoading}
                />

                {favoritesWithDetails.length > 0 ? (
                    <List disablePadding>
                        {favoritesWithDetails.map((car, index) => (
                            <React.Fragment key={car.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            borderRadius: 1
                                        }
                                    }}
                                >
                                    <Avatar sx={{
                                        bgcolor: 'primary.main',
                                        mr: 2,
                                        color: 'common.white'
                                    }}>
                                        <DirectionsCar />
                                    </Avatar>

                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                {car.brand} {car.model} ({car.year})
                                            </Typography>
                                        }
                                        secondary={
                                            <React.Fragment>
                                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        VIN: {car.vin}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Цвет: {car.color}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Пробег: {car.mileage} км
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Цена: {car.price.toLocaleString()} $
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Автосалон: {car.dealer}
                                                    </Typography>
                                                </Stack>
                                            </React.Fragment>
                                        }
                                    />

                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleRemoveFavorite(car.id)}
                                            color="error"
                                            disabled={isFavoriteLoading}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < favoritesWithDetails.length - 1 && (
                                    <Divider variant="inset" component="li" />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Box sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 3
                    }}>
                        <Typography variant="body1" color="text.secondary">
                            Нет избранных автомобилей
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<Save />}
                        disabled={isLoading}
                        sx={{ minWidth: 180 }}
                    >
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserForm;