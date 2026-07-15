package com.resourceallocation.service;

import com.resourceallocation.dto.AvailableResourceDTO;
import com.resourceallocation.dto.OverloadedResourceDTO;
import com.resourceallocation.dto.UtilizationReportDTO;
import com.resourceallocation.dto.ProjectMemberCountDTO;
import com.resourceallocation.entity.Employee;
import com.resourceallocation.repository.EmployeeRepository;
import com.resourceallocation.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    public ReportService(EmployeeRepository employeeRepository, ProjectRepository projectRepository) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
    }

    public List<UtilizationReportDTO> getUtilizationReport() {
        return employeeRepository.getUtilizationReport();
    }

    public List<AvailableResourceDTO> getAvailableResources() {
        return employeeRepository.getAvailableResources();
    }

    public List<OverloadedResourceDTO> getOverloadedEmployees() {
        return employeeRepository.getOverloadedEmployees();
    }

    public List<Employee> getIdleEmployees() {
        return employeeRepository.getIdleEmployees();
    }

    public List<ProjectMemberCountDTO> getProjectMemberCounts() {
        return projectRepository.getProjectMemberCounts();
    }
}
