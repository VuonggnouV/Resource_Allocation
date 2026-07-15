package com.resourceallocation.service;

import com.resourceallocation.request.AllocationRequest;
import com.resourceallocation.entity.Allocation;
import com.resourceallocation.entity.Employee;
import com.resourceallocation.entity.Project;
import com.resourceallocation.exception.AllocationExceededException;
import com.resourceallocation.exception.AllocationNotFoundException;
import com.resourceallocation.exception.CompletedProjectException;
import com.resourceallocation.exception.EmployeeNotFoundException;
import com.resourceallocation.exception.ProjectNotFoundException;
import com.resourceallocation.repository.AllocationRepository;
import com.resourceallocation.repository.EmployeeRepository;
import com.resourceallocation.repository.ProjectRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    public AllocationService(AllocationRepository allocationRepository,
                             EmployeeRepository employeeRepository,
                             ProjectRepository projectRepository) {
        this.allocationRepository = allocationRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
    }

    public Allocation create(AllocationRequest request) {
        log.info("Creating allocation: employeeId={}, projectId={}, percent={}%", 
                request.getEmployeeId(), request.getProjectId(), request.getAllocationPercent());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> {
                    log.warn("Employee not found with ID: {}", request.getEmployeeId());
                    return new EmployeeNotFoundException(request.getEmployeeId());
                });

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> {
                    log.warn("Project not found with ID: {}", request.getProjectId());
                    return new ProjectNotFoundException(request.getProjectId());
                });

        validateProjectStatus(project);
        validateAllocationLimit(employee.getEmployeeId(), request.getAllocationPercent());

        Allocation allocation = new Allocation();
        allocation.setEmployee(employee);
        allocation.setProject(project);
        allocation.setAllocationPercent(request.getAllocationPercent());
        allocation.setRoleInProject(request.getRoleInProject());
        allocation.setStartDate(request.getStartDate());
        allocation.setEndDate(request.getEndDate());

        Allocation saved = allocationRepository.save(allocation);
        log.info("Successfully created allocation with ID: {}", saved.getAllocationId());
        return saved;
    }

    public Allocation update(Long allocationId, AllocationRequest request) {
        log.info("Updating allocation ID={}: employeeId={}, projectId={}, percent={}%", 
                allocationId, request.getEmployeeId(), request.getProjectId(), request.getAllocationPercent());

        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> {
                    log.warn("Allocation not found with ID: {}", allocationId);
                    return new AllocationNotFoundException(allocationId);
                });

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> {
                    log.warn("Employee not found with ID: {}", request.getEmployeeId());
                    return new EmployeeNotFoundException(request.getEmployeeId());
                });

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> {
                    log.warn("Project not found with ID: {}", request.getProjectId());
                    return new ProjectNotFoundException(request.getProjectId());
                });

        validateProjectStatus(project);

        Integer oldAllocation = allocation.getAllocationPercent();
        Integer newAllocation = request.getAllocationPercent();
        Integer currentTotal = allocationRepository.sumAllocationByEmployeeId(employee.getEmployeeId());

        Integer projectedTotal;
        if (allocation.getEmployee().getEmployeeId().equals(employee.getEmployeeId())) {
            projectedTotal = currentTotal - oldAllocation + newAllocation;
        } else {
            projectedTotal = currentTotal + newAllocation;
        }

        if (projectedTotal > 100) {
            log.warn("Validation failed: employeeId={} projected allocation ({}%) exceeds 100%", 
                    employee.getEmployeeId(), projectedTotal);
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }

        allocation.setEmployee(employee);
        allocation.setProject(project);
        allocation.setAllocationPercent(newAllocation);
        allocation.setRoleInProject(request.getRoleInProject());
        allocation.setStartDate(request.getStartDate());
        allocation.setEndDate(request.getEndDate());

        Allocation saved = allocationRepository.save(allocation);
        log.info("Successfully updated allocation ID: {}", saved.getAllocationId());
        return saved;
    }

    public void delete(Long id) {
        log.info("Removing allocation ID: {}", id);
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Allocation not found with ID: {}", id);
                    return new AllocationNotFoundException(id);
                });
        allocationRepository.delete(allocation);
        log.info("Successfully removed allocation ID: {}", id);
    }

    public List<Allocation> findAll() {
        return allocationRepository.findAll();
    }

    public Page<Allocation> findAll(String employeeName, String projectName, String roleInProject, Integer allocationPercent, Pageable pageable) {
        String cleanEmp = (employeeName == null) ? "" : employeeName.trim();
        String cleanProj = (projectName == null) ? "" : projectName.trim();
        String cleanRole = (roleInProject == null || "ALL".equalsIgnoreCase(roleInProject.trim())) ? "" : roleInProject.trim();
        return allocationRepository.filterAllocations(cleanEmp, cleanProj, cleanRole, allocationPercent, pageable);
    }

    public Integer getEmployeeWorkload(Long employeeId) {
        return allocationRepository.sumAllocationByEmployeeId(employeeId);
    }

    private void validateAllocationLimit(Long employeeId, Integer newAllocation) {
        Integer currentTotal = allocationRepository.sumAllocationByEmployeeId(employeeId);
        Integer projectedTotal = currentTotal + newAllocation;

        if (projectedTotal > 100) {
            log.warn("Validation failed: employeeId={} projected allocation ({}%) exceeds 100%", 
                    employeeId, projectedTotal);
            throw new AllocationExceededException("Employee allocation exceeds 100%");
        }
    }

    private void validateProjectStatus(Project project) {
        if ("COMPLETED".equalsIgnoreCase(project.getStatus())) {
            log.warn("Validation failed: project {} status is COMPLETED", project.getProjectCode());
            throw new CompletedProjectException("Cannot allocate resources to a completed project");
        }
    }
}
