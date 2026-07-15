package com.resourceallocation.controller;

import com.resourceallocation.dto.AvailableResourceDTO;
import com.resourceallocation.dto.OverloadedResourceDTO;
import com.resourceallocation.dto.UtilizationReportDTO;
import com.resourceallocation.dto.ProjectMemberCountDTO;
import com.resourceallocation.entity.Employee;
import com.resourceallocation.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/utilization")
    public ResponseEntity<List<UtilizationReportDTO>> getUtilizationReport() {
        return ResponseEntity.ok(reportService.getUtilizationReport());
    }

    @GetMapping("/available")
    public ResponseEntity<List<AvailableResourceDTO>> getAvailableResources() {
        return ResponseEntity.ok(reportService.getAvailableResources());
    }

    @GetMapping("/overloaded")
    public ResponseEntity<List<OverloadedResourceDTO>> getOverloadedEmployees() {
        return ResponseEntity.ok(reportService.getOverloadedEmployees());
    }

    @GetMapping("/idle-employees")
    public ResponseEntity<List<Employee>> getIdleEmployees() {
        return ResponseEntity.ok(reportService.getIdleEmployees());
    }

    @GetMapping("/project-members")
    public ResponseEntity<List<ProjectMemberCountDTO>> getProjectMemberCounts() {
        return ResponseEntity.ok(reportService.getProjectMemberCounts());
    }
}
