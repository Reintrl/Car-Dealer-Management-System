import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    TableSortLabel, Box, Typography, Stack, Chip, IconButton, Tooltip,
    TextField, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, InfoOutlined, Search, Clear } from '@mui/icons-material';
import { getAllDealers, deleteDealer, getAllCars } from '../services/api';
import DealerForm from './DealerForm';

const DealerList = () => {
    const [dealers, setDealers] = useState([]);
    const [filteredDealers, setFilteredDealers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'asc'
    });
    const [dealerToDelete, setDealerToDelete] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cars, setCars] = useState([]);
    const [carsDialogOpen, setCarsDialogOpen] = useState(false);
    const [currentDealerCars, setCurrentDealerCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const [dealersRes, carsRes] = await Promise.all([
                getAllDealers(),
                getAllCars()
            ]);
            setDealers(dealersRes.data);
            setFilteredDealers(dealersRes.data);
            setCars(carsRes.data);
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Эффект для применения поиска
    useEffect(() => {
        if (!searchTerm) {
            setFilteredDealers(dealers);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = dealers.filter(dealer =>
            dealer.name.toLowerCase().includes(term) ||
            dealer.address.toLowerCase().includes(term) ||
            dealer.phoneNumber.toLowerCase().includes(term)
        );
        setFilteredDealers(filtered);
    }, [searchTerm, dealers]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDealers = [...filteredDealers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getCarsCount = (dealerId) => {
        return cars.filter(car => car.dealerId === dealerId).length;
    };

    const handleShowCars = (dealerId) => {
        const dealerCars = cars.filter(car => car.dealerId === dealerId);
        setCurrentDealerCars(dealerCars);
        setCarsDialogOpen(true);
    };

    const handleDialogOpen = (dealer = null) => {
        setSelectedDealer(dealer);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedDealer(null);
    };

    const openDeleteDialog = (dealer) => {
        setDealerToDelete(dealer);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteDealer(dealerToDelete.id);
            fetchData();
        } catch (err) {
            console.error("Ошибка удаления:", err);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
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
                    Список автосалонов
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => handleDialogOpen()}
                    sx={{ minWidth: 180 }}
                >
                    Добавить автосалон
                </Button>
            </Box>

            {/* Панель поиска */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Поиск по названию, адресу или телефону..."
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
                        Найдено: {filteredDealers.length} из {dealers.length}
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
                    maxHeight: 'calc(100vh - 300px)',
                    minWidth: '100%',
                }}
            >
                <Table stickyHeader sx={{ width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'name'}
                                    direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    <Typography variant="subtitle2" fontWeight="bold">Название</Typography>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Адрес</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">Телефон</Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Typography variant="subtitle2" fontWeight="bold">Автомобили</Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 180 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Действия</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDealers.length > 0 ? (
                            sortedDealers.map((dealer) => (
                                <TableRow key={dealer.id} hover>
                                    <TableCell>{dealer.name}</TableCell>
                                    <TableCell>{dealer.address}</TableCell>
                                    <TableCell>{dealer.phoneNumber}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => handleShowCars(dealer.id)}
                                            startIcon={<InfoOutlined />}
                                        >
                                            {getCarsCount(dealer.id)} шт.
                                        </Button>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleDialogOpen(dealer)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => openDeleteDialog(dealer)}
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
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {dealers.length === 0 ? 'Нет данных об автосалонах' : 'Ничего не найдено'}
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
                    <DealerForm
                        initialData={selectedDealer}
                        onSuccess={() => {
                            fetchData();
                            handleDialogClose();
                        }}
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
                        Вы действительно хотите удалить автосалон <strong>{dealerToDelete?.name}</strong>?
                    </Typography>
                    {dealerToDelete && getCarsCount(dealerToDelete.id) > 0 && (
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: '#fff8e1',
                            borderRadius: 1
                        }}>
                            <Typography variant="body2" color="error">
                                <strong>Внимание:</strong> В автосалоне {getCarsCount(dealerToDelete.id)} автомобилей!
                                Они также будут удалены.
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
                open={carsDialogOpen}
                onClose={() => setCarsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Автомобили в автосалоне {selectedDealer?.name}</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Марка</Typography></TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Модель</Typography></TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Год</Typography></TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Цена</Typography></TableCell>
                                    <TableCell><Typography variant="subtitle2" fontWeight="bold">Статус</Typography></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentDealerCars.map((car) => (
                                    <TableRow key={car.id}>
                                        <TableCell>{car.brand}</TableCell>
                                        <TableCell>{car.model}</TableCell>
                                        <TableCell>{car.year}</TableCell>
                                        <TableCell>${car.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {car.orderId ? (
                                                <Chip
                                                    label="В заказе"
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    label="Доступен"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCarsDialogOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DealerList;