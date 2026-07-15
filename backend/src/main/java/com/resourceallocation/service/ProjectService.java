package com.resourceallocation.service;

import com.resourceallocation.request.ProjectRequest;
import com.resourceallocation.entity.Project;
import com.resourceallocation.exception.ProjectNotFoundException;
import com.resourceallocation.repository.ProjectRepository;
import com.resourceallocation.repository.AllocationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AllocationRepository allocationRepository;

    public ProjectService(ProjectRepository projectRepository, AllocationRepository allocationRepository) {
        this.projectRepository = projectRepository;
        this.allocationRepository = allocationRepository;
    }

    public Project create(ProjectRequest request) {
        Project project = new Project();
        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setCustomer(request.getCustomer());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus());
        return projectRepository.save(project);
    }

    @Transactional
    public Project update(Long id, ProjectRequest request) {
        Project project = findById(id);

        // Kiểm tra mã dự án trùng với dự án khác
        projectRepository.findByProjectCode(request.getProjectCode())
                .ifPresent(existing -> {
                    if (!existing.getProjectId().equals(id)) {
                        throw new RuntimeException("Mã dự án '" + request.getProjectCode() + "' đã tồn tại.");
                    }
                });

        project.setProjectCode(request.getProjectCode());
        project.setProjectName(request.getProjectName());
        project.setCustomer(request.getCustomer());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus());
        return projectRepository.save(project);
    }

    @Transactional
    public void delete(Long id) {
        Project project = findById(id);
        if (allocationRepository.existsByProject_ProjectId(id)) {
            throw new RuntimeException("Không thể xóa dự án này vì đang có lịch phân bổ nhân lực.");
        }
        projectRepository.delete(project);
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Page<Project> findAll(String projectCode, String projectName, String customer, String status, String sortBy, String sortDir, Pageable pageable) {
        String cleanCode = (projectCode == null) ? "" : projectCode.trim();
        String cleanName = (projectName == null) ? "" : projectName.trim();
        String cleanCust = (customer == null) ? "" : customer.trim();
        String cleanStatus = (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status.trim())) ? null : status.trim();
        return projectRepository.filterProjects(cleanCode, cleanName, cleanCust, cleanStatus, pageable);
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }
}
