import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    FormHelperText,
    Alert
} from '@mui/material';
import { createDealer, updateDealer } from '../services/api';

const DealerForm = ({ initialData = null, onSuccess }) => {
    const [dealerData, setDealerData] = useState({
        name: '',
        address: '',
        phoneNumber: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setDealerData({
                name: initialData.name || '',
                address: initialData.address || '',
                phoneNumber: initialData.phoneNumber || ''
            });
        }
    }, [initialData]);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value) return "Название обязательно";
                if (value.length < 2 || value.length > 100) return "Длина названия 2-100 символов";
                if (!/^[a-zA-ZА-Яа-я0-9\s\-.,&]+$/.test(value))
                    return "Допустимы буквы, цифры, пробелы и символы -.,&";
                return '';

            case 'address':
                if (!value) return "Адрес обязателен";
                if (value.length < 5 || value.length > 200) return "Длина адреса 5-200 символов";
                return '';

            case 'phoneNumber':
                if (!value) return "Телефон обязателен";
                if (!/^\+?[0-9\s\-()]{7,20}$/.test(value))
                    return "Неверный формат телефона";
                return '';

            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        setDealerData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(dealerData).forEach(key => {
            const error = validateField(key, dealerData[key]);
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
                await updateDealer(initialData.id, dealerData);
            } else {
                await createDealer(dealerData);
            }
            onSuccess();
        } catch (err) {
            console.error("Ошибка сохранения", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                {initialData ? 'Редактировать автосалон' : 'Добавить автосалон'}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <TextField
                        label="Название"
                        variant="outlined"
                        fullWidth
                        required
                        name="name"
                        value={dealerData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name || "Пример: АвтоМир СПб"}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Адрес"
                        variant="outlined"
                        fullWidth
                        required
                        name="address"
                        value={dealerData.address}
                        onChange={handleChange}
                        error={!!errors.address}
                        helperText={errors.address || "Пример: Санкт-Петербург, Невский пр-т 100"}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Телефон"
                        variant="outlined"
                        fullWidth
                        required
                        name="phoneNumber"
                        value={dealerData.phoneNumber}
                        onChange={handleChange}
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber || "Пример: +7 (812) 555-12-34"}
                        sx={{ mb: 1 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={Object.keys(errors).some(key => errors[key]) || isLoading}
                        sx={{ minWidth: 200 }}
                    >
                        {isLoading ? 'Сохранение...' : initialData ? 'Сохранить' : 'Добавить'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DealerForm;