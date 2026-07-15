package com.resourceallocation.exception;

public class AllocationNotFoundException extends RuntimeException {
    public AllocationNotFoundException(Long id) {
        super("Allocation with ID " + id + " not found");
    }
}
