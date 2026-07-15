package com.resourceallocation.repository;

import com.resourceallocation.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    java.util.Optional<Project> findByProjectCode(String projectCode);

    @Query("SELECT p FROM Project p WHERE " +
           "(:projectCode IS NULL OR :projectCode = '' OR LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :projectCode, '%'))) AND " +
           "(:projectName IS NULL OR :projectName = '' OR LOWER(p.projectName) LIKE LOWER(CONCAT('%', :projectName, '%'))) AND " +
           "(:customer IS NULL OR :customer = '' OR LOWER(p.customer) LIKE LOWER(CONCAT('%', :customer, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR p.status = :status)")
    Page<Project> filterProjects(
            @Param("projectCode") String projectCode,
            @Param("projectName") String projectName,
            @Param("customer") String customer,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT new com.resourceallocation.dto.ProjectMemberCountDTO(p.projectCode, p.projectName, COUNT(DISTINCT a.employee.employeeId)) " +
           "FROM Project p LEFT JOIN Allocation a ON p.projectId = a.project.projectId " +
           "GROUP BY p.projectId, p.projectCode, p.projectName")
    java.util.List<com.resourceallocation.dto.ProjectMemberCountDTO> getProjectMemberCounts();
}
