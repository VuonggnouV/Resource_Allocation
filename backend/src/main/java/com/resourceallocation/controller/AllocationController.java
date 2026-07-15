package com.resourceallocation.controller;

import com.resourceallocation.request.AllocationRequest;
import com.resourceallocation.entity.Allocation;
import com.resourceallocation.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/allocations")
public class AllocationController {

    private final AllocationService allocationService;
    private final com.resourceallocation.service.EmployeeService employeeService;

    public AllocationController(AllocationService allocationService, com.resourceallocation.service.EmployeeService employeeService) {
        this.allocationService = allocationService;
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<Allocation> create(@Valid @RequestBody AllocationRequest request) {
        return new ResponseEntity<>(allocationService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Allocation> update(@PathVariable Long id, @Valid @RequestBody AllocationRequest request) {
        return ResponseEntity.ok(allocationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        allocationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Allocation>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String roleInProject,
            @RequestParam(required = false) Integer allocationPercent,
            @RequestParam(defaultValue = "employee.fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(allocationService.findAll(employeeName, projectName, roleInProject, allocationPercent, pageable));
    }

    @GetMapping("/employees/{employeeId}/workload")
    public ResponseEntity<Map<String, Object>> getEmployeeWorkload(@PathVariable Long employeeId) {
        com.resourceallocation.entity.Employee employee = employeeService.findById(employeeId);
        Integer totalAllocation = allocationService.getEmployeeWorkload(employeeId);
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("employeeName", employee.getFullName());
        response.put("totalAllocation", totalAllocation);
        response.put("available", 100 - totalAllocation);
        return ResponseEntity.ok(response);
    }
}
