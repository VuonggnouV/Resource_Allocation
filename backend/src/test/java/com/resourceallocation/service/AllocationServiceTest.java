package com.resourceallocation.service;

import com.resourceallocation.request.AllocationRequest;
import com.resourceallocation.entity.Allocation;
import com.resourceallocation.entity.Employee;
import com.resourceallocation.entity.Project;
import com.resourceallocation.exception.AllocationExceededException;
import com.resourceallocation.exception.CompletedProjectException;
import com.resourceallocation.exception.EmployeeNotFoundException;
import com.resourceallocation.exception.ProjectNotFoundException;
import com.resourceallocation.repository.AllocationRepository;
import com.resourceallocation.repository.EmployeeRepository;
import com.resourceallocation.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AllocationServiceTest {

    @Mock
    private AllocationRepository allocationRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private AllocationService allocationService;

    private Employee employee;
    private Project activeProject;
    private Project completedProject;
    private AllocationRequest request;

    @BeforeEach
    void setUp() {
        employee = new Employee("EMP001", "Test Employee", "test@company.com", "Developer", "IT");
    }

    private void setId(Object target, String fieldName, Long value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void create_Success() {
        setId(employee, "employeeId", 1L);
        activeProject = new Project("NCG", "NCG Project", "Customer", LocalDate.now(), null, "ACTIVE");
        setId(activeProject, "projectId", 2L);

        request = new AllocationRequest(1L, 2L, 50, "Backend Developer", LocalDate.now(), null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(40);

        Allocation savedAllocation = new Allocation(employee, activeProject, 50, "Backend Developer", LocalDate.now(), null);
        setId(savedAllocation, "allocationId", 100L);
        when(allocationRepository.save(any(Allocation.class))).thenReturn(savedAllocation);

        Allocation result = allocationService.create(request);

        assertNotNull(result);
        assertEquals(100L, result.getAllocationId());
        assertEquals(50, result.getAllocationPercent());
        verify(allocationRepository, times(1)).save(any(Allocation.class));
    }

    @Test
    void create_EmployeeNotFound() {
        request = new AllocationRequest(1L, 2L, 50, "Backend Developer", LocalDate.now(), null);
        when(employeeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EmployeeNotFoundException.class, () -> allocationService.create(request));
    }

    @Test
    void create_ProjectNotFound() {
        setId(employee, "employeeId", 1L);
        request = new AllocationRequest(1L, 2L, 50, "Backend Developer", LocalDate.now(), null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ProjectNotFoundException.class, () -> allocationService.create(request));
    }

    @Test
    void create_CompletedProject() {
        setId(employee, "employeeId", 1L);
        completedProject = new Project("LEGACY", "Legacy Project", "Customer", LocalDate.now().minusMonths(6), LocalDate.now().minusDays(1), "COMPLETED");
        setId(completedProject, "projectId", 2L);

        request = new AllocationRequest(1L, 2L, 50, "Backend Developer", LocalDate.now(), null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(completedProject));

        assertThrows(CompletedProjectException.class, () -> allocationService.create(request));
    }

    @Test
    void create_AllocationExceeded() {
        setId(employee, "employeeId", 1L);
        activeProject = new Project("NCG", "NCG Project", "Customer", LocalDate.now(), null, "ACTIVE");
        setId(activeProject, "projectId", 2L);

        request = new AllocationRequest(1L, 2L, 70, "Backend Developer", LocalDate.now(), null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(40); // 40 + 70 = 110 > 100

        assertThrows(AllocationExceededException.class, () -> allocationService.create(request));
    }

    @Test
    void update_Success_SameEmployee() {
        setId(employee, "employeeId", 1L);
        activeProject = new Project("NCG", "NCG Project", "Customer", LocalDate.now(), null, "ACTIVE");
        setId(activeProject, "projectId", 2L);

        Allocation existingAllocation = new Allocation(employee, activeProject, 40, "Backend Developer", LocalDate.now(), null);
        setId(existingAllocation, "allocationId", 100L);

        request = new AllocationRequest(1L, 2L, 60, "Senior Backend Developer", LocalDate.now(), null);

        when(allocationRepository.findById(100L)).thenReturn(Optional.of(existingAllocation));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationByEmployeeId(1L)).thenReturn(40); // Tổng hiện tại là 40 (đã bao gồm 40% cũ)

        when(allocationRepository.save(any(Allocation.class))).thenReturn(existingAllocation);

        Allocation result = allocationService.update(100L, request);

        assertNotNull(result);
        assertEquals(60, result.getAllocationPercent());
        assertEquals("Senior Backend Developer", result.getRoleInProject());
    }

    @Test
    void update_Success_DifferentEmployee() {
        setId(employee, "employeeId", 1L); // Employee cũ (A)
        Employee employeeB = new Employee("EMP002", "Employee B", "b@company.com", "Developer", "IT");
        setId(employeeB, "employeeId", 3L); // Employee mới (B)

        activeProject = new Project("NCG", "NCG Project", "Customer", LocalDate.now(), null, "ACTIVE");
        setId(activeProject, "projectId", 2L);

        Allocation existingAllocation = new Allocation(employee, activeProject, 50, "Backend Developer", LocalDate.now(), null);
        setId(existingAllocation, "allocationId", 100L);

        request = new AllocationRequest(3L, 2L, 40, "Backend Developer", LocalDate.now(), null); // Chuyển sang B, 40%

        when(allocationRepository.findById(100L)).thenReturn(Optional.of(existingAllocation));
        when(employeeRepository.findById(3L)).thenReturn(Optional.of(employeeB));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(activeProject));
        when(allocationRepository.sumAllocationByEmployeeId(3L)).thenReturn(50); // B đang có 50% rồi

        when(allocationRepository.save(any(Allocation.class))).thenReturn(existingAllocation);

        Allocation result = allocationService.update(100L, request);

        assertNotNull(result);
        assertEquals(3L, result.getEmployee().getEmployeeId());
        assertEquals(40, result.getAllocationPercent());
    }
}
