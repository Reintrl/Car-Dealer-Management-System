package com.example.cardealer.constants;

/**
 * Holds "not found" error messages.
 */
public final class ErrorMessages {
    public static final String CAR_NOT_FOUND = "Car not found with ID: ";
    public static final String INVALID_CAR_ID = "Invalid car ID: ";
    public static final String CAR_DATA_NULL = "Car data cannot be null";
    public static final String VIN_ALREADY_EXISTS = "Car already exists with VIN: ";
    public static final String VIN_CHANGE_NOT_ALLOWED = "Changing is not allowed VIN: ";
    public static final String INVALID_VIN_LENGTH = "VIN must be exactly 17 characters";
    public static final String INVALID_VIN_FORMAT = "VIN contains invalid characters";
    public static final String VIN_EMPTY = "VIN cannot be empty";
    public static final String MODEL_EMPTY = "Model cannot be empty";
    public static final String MODEL_TOO_LONG = "Model cannot exceed 50 characters";
    public static final String BRAND_EMPTY = "Brand cannot be empty";
    public static final String BRAND_TOO_LONG = "Brand cannot exceed 50 characters";
    public static final String INVALID_YEAR_RANGE = "Year must be between %d and %d";
    public static final String PRICE_POSITIVE = "Price must be positive";
    public static final String MILEAGE_NEGATIVE = "Mileage cannot be negative";
    public static final String COLOR_EMPTY = "Color cannot be empty";
    public static final String COLOR_TOO_LONG = "Color cannot exceed 30 characters";
    public static final String COLOR_INVALID = "Color contains invalid characters";

    public static final String DEALER_NOT_FOUND = "Dealer not found with id: ";
    public static final String INVALID_DEALER_ID = "Dealer ID must be positive";
    public static final String DEALER_DATA_NULL = "Dealer data cannot be null";
    public static final String NAME_ALREADY_EXISTS = "Dealer with this name already exists";
    public static final String PHONE_ALREADY_EXISTS = "Dealer with this phone number already exists";
    public static final String ADDRESS_ALREADY_EXISTS = "Dealer with this address already exists";
    public static final String INVALID_BRAND = "Brand must be between 2 and 50 characters";

    public static final String ORDER_NOT_FOUND = "Order not found with id: ";
    public static final String INVALID_ORDER_ID = "Order ID must be positive";
    public static final String ORDER_DATA_NULL = "Order data cannot be null";
    public static final String ORDER_NO_CARS = "Order must contain at least one car";
    public static final String ORDER_NO_USER = "Order must have a user";
    public static final String CAR_ALREADY_ORDERED = "Car with ID %d is already ordered";

    public static final String USER_NOT_FOUND = "User not found with id: ";
    public static final String INVALID_USER_ID = "User ID must be positive";
    public static final String USER_DATA_NULL = "User data cannot be null";
    public static final String USERNAME_EMPTY = "Username cannot be empty";
    public static final String USERNAME_ALREADY_EXISTS = "Username already exists";
    public static final String EMAIL_ALREADY_EXISTS = "Email already exists";
    public static final String CAR_ALREADY_FAVORITED = "Car is already in favorites";
    public static final String CAR_NOT_IN_FAVORITES = "Car is not in user's favorites";
    public static final String INVALID_EMAIL_FORMAT = "Invalid email format";

    private ErrorMessages() {} // No instances
}
