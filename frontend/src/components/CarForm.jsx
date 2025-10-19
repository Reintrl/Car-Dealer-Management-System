import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    MenuItem,
    FormHelperText,
    InputAdornment,
    Alert
} from '@mui/material';
import { createCar, updateCar, getAllDealers } from '../services/api';

const CarForm = ({ initialData = null, onSuccess, isInOrder = false }) => {
    const [carData, setCarData] = useState({
        vin: '',
        model: '',
        brand: '',
        year: '',
        price: '',
        color: '',
        mileage: '',
        dealerId: null
    });

    const [dealers, setDealers] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDealers = async () => {
            try {
                const res = await getAllDealers();
                setDealers(res.data);
            } catch (err) {
                console.error("Ошибка загрузки автосалонов", err);
            }
        };
        fetchDealers();

        if (initialData) {
            setCarData({
                vin: initialData.vin || '',
                model: initialData.model || '',
                brand: initialData.brand || '',
                year: initialData.year || '',
                price: initialData.price || '',
                color: initialData.color || '',
                mileage: initialData.mileage || '',
                dealerId: initialData.dealerId || null
            });
        }
    }, [initialData]);

    const validateField = (name, value) => {
        switch (name) {
            case 'vin':
                if (!value) return "VIN не может быть пустым";
                if (value.length !== 17) return "VIN должен содержать ровно 17 символов";
                if (!/^[A-HJ-NPR-Z\d]{17}$/.test(value))
                    return "Неверный формат VIN (нельзя использовать I, O, Q)";
                return '';

            case 'model':
                if (!value) return "Модель не может быть пустой";
                if (!/^[a-zA-Z0-9\s\-]+$/.test(value))
                    return "Только буквы, цифры, пробелы и дефисы";
                return '';

            case 'brand':
                if (!value) return "Марка не может быть пустой";
                if (!/^[a-zA-Z\s\-]+$/.test(value))
                    return "Только буквы, пробелы и дефисы";
                return '';

            case 'year':
                if (!value) return "Год не может быть пустым";
                if (value < 1886) return "Год должен быть после 1886";
                if (value > new Date().getFullYear() + 1)
                    return "Год не может быть в будущем";
                return '';

            case 'price':
                if (value < 0) return "Цена не может быть отрицательной";
                if (!/^\d{1,7}(\.\d{1,2})?$/.test(value))
                    return "Максимум 7 цифр до точки и 2 после";
                return '';

            case 'color':
                if (!value) return "Цвет не может быть пустым";
                if (!/^[a-zA-Z\s\-]+$/.test(value))
                    return "Только буквы, пробелы и дефисы";
                return '';

            case 'mileage':
                if (value < 0) return "Пробег не может быть отрицательным";
                if (!/^\d{1,6}(\.\d{1,1})?$/.test(value))
                    return "Максимум 6 цифр до точки и 1 после";
                return '';

            case 'dealerId':
                if (!value && !initialData) return "Необходимо выбрать автосалон";
                return '';

            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        setCarData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'dealerId'
                ? value === '' ? '' : Number(value)
                : name === 'price' || name === 'mileage'
                    ? value === '' ? '' : parseFloat(value)
                    : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(carData).forEach(key => {
            const error = validateField(key, carData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (initialData) {
                await updateCar(initialData.id, carData);
            } else {
                await createCar(carData);
            }
            onSuccess();
        } catch (err) {
            console.error("Ошибка сохранения автомобиля", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getDisabledFields = () => {
        const disabled = {};

        if (!initialData) return disabled;

        // Если машина в заказе - блокируем все поля
        if (isInOrder) {
            return {
                vin: true,
                brand: true,
                model: true,
                year: true,
                price: true,
                color: true,
                mileage: true,
                dealerId: true
            };
        }

        // Для редактирования авто не в заказе блокируем только основные поля
        return {
            vin: true,
            brand: true,
            model: true,
            year: true
        };
    };

    const disabledFields = getDisabledFields();

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                {initialData ? 'Редактировать авто' : 'Добавить авто'}
            </Typography>

            {initialData && isInOrder && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Этот автомобиль находится в заказе и не может быть изменен
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* VIN */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="VIN"
                        variant="outlined"
                        fullWidth
                        required
                        name="vin"
                        value={carData.vin}
                        onChange={handleChange}
                        error={!!errors.vin}
                        helperText={errors.vin || "Пример: 1HGCM82633A123456 (17 символов)"}
                        inputProps={{
                            maxLength: 17,
                            pattern: "^[A-HJ-NPR-Z\\d]{17}$"
                        }}
                        disabled={disabledFields.vin}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                {/* Model */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Модель"
                        variant="outlined"
                        fullWidth
                        required
                        name="model"
                        value={carData.model}
                        onChange={handleChange}
                        error={!!errors.model}
                        helperText={errors.model || "Пример: Camry"}
                        inputProps={{
                            pattern: "^[a-zA-Z0-9\\s\\-]+$"
                        }}
                        disabled={disabledFields.model}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                {/* Brand */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Марка"
                        variant="outlined"
                        fullWidth
                        required
                        name="brand"
                        value={carData.brand}
                        onChange={handleChange}
                        error={!!errors.brand}
                        helperText={errors.brand || "Пример: Toyota"}
                        inputProps={{
                            pattern: "^[a-zA-Z\\s\\-]+$"
                        }}
                        disabled={disabledFields.brand}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                {/* Year */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Год"
                        variant="outlined"
                        fullWidth
                        required
                        name="year"
                        type="number"
                        value={carData.year}
                        onChange={handleChange}
                        error={!!errors.year}
                        helperText={errors.year || "Пример: 2022"}
                        inputProps={{
                            min: 1886,
                            max: new Date().getFullYear() + 1,
                            step: 1
                        }}
                        disabled={disabledFields.year}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                {/* Price */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Цена ($)"
                        variant="outlined"
                        fullWidth
                        required
                        name="price"
                        type="number"
                        value={carData.price}
                        onChange={handleChange}
                        error={!!errors.price}
                        helperText={errors.price || "Пример: 25000.00"}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{
                            min: 0,
                            step: 0.01
                        }}
                        disabled={disabledFields.price}
                        sx={{
                            mb: 1,
                            '& input[type=number]': {
                                '-moz-appearance': 'textfield',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0
                                }
                            }
                        }}
                    />
                </Grid>

                {/* Color */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Цвет"
                        variant="outlined"
                        fullWidth
                        required
                        name="color"
                        value={carData.color}
                        onChange={handleChange}
                        error={!!errors.color}
                        helperText={errors.color || "Пример: Красный"}
                        inputProps={{
                            pattern: "^[a-zA-Z\\s\\-]+$"
                        }}
                        disabled={disabledFields.color}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                {/* Mileage */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Пробег (км)"
                        variant="outlined"
                        fullWidth
                        required
                        name="mileage"
                        type="number"
                        value={carData.mileage}
                        onChange={handleChange}
                        error={!!errors.mileage}
                        helperText={errors.mileage || "Пример: 15000.5"}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">км</InputAdornment>,
                        }}
                        inputProps={{
                            min: 0,
                            step: 0.1
                        }}
                        disabled={disabledFields.mileage}
                        sx={{
                            mb: 1,
                            '& input[type=number]': {
                                '-moz-appearance': 'textfield',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0
                                }
                            }
                        }}
                    />
                </Grid>

                {/* Dealer Selector */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        label="Автосалон"
                        variant="outlined"
                        fullWidth
                        required={!initialData}
                        name="dealerId"
                        value={carData.dealerId || ''}
                        onChange={handleChange}
                        error={!!errors.dealerId}
                        disabled={disabledFields.dealerId}
                        sx={{
                            mb: 1,
                            '& .MuiInputLabel-root': {
                                transform: 'translate(14px, -9px) scale(0.75)',
                                backgroundColor: 'background.paper',
                                padding: '0 5px'
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: errors.dealerId ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
                                },
                                '&:hover fieldset': {
                                    borderColor: errors.dealerId ? 'error.main' : 'rgba(0, 0, 0, 0.87)',
                                },
                            }
                        }}
                        InputLabelProps={{
                            shrink: true,
                            style: {
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                transformOrigin: 'top left'
                            }
                        }}
                        SelectProps={{
                            displayEmpty: true,
                            renderValue: (selected) => {
                                if (!selected) return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Выберите автосалон</span>;
                                const dealer = dealers.find(d => d.id === selected);
                                return dealer ? (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>{dealer.name}</span>
                                    </div>
                                ) : selected;
                            }
                        }}
                    >
                        <MenuItem value="" disabled sx={{ minHeight: '48px' }}>
                            <em>Выберите автосалон</em>
                        </MenuItem>
                        {dealers.map((dealer) => (
                            <MenuItem
                                key={dealer.id}
                                value={dealer.id}
                                sx={{
                                    minHeight: '48px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{dealer.name}</span>
                                <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                    {dealer.address}
                                </span>
                            </MenuItem>
                        ))}
                    </TextField>
                    {errors.dealerId && (
                        <FormHelperText error>{errors.dealerId}</FormHelperText>
                    )}
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={Object.keys(errors).some(key => errors[key]) || isLoading || isInOrder}
                        sx={{ minWidth: 200 }}
                    >
                        {isLoading ? 'Сохранение...' :
                            initialData ? 'Сохранить изменения' : 'Добавить автомобиль'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CarForm;
