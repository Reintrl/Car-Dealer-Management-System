package com.example.cardealer.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The {@code ErrorResponse} class represents an error response object.
 * It is used to standardize error messages in the application.
 * Contains the error status and the corresponding message.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {

    private int status;
    private String message;
}