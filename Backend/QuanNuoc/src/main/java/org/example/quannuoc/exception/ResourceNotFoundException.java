package org.example.quannuoc.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " không tìm thấy với id: " + id);
    }
}
