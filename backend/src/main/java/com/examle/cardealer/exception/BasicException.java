package com.example.cardealer.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Interface for other exceptions to implement. */
public class BasicException extends RuntimeException {
    @Getter
    final HttpStatus status;
    final String message;

    /** Constructor of the class. */
    public BasicException(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
