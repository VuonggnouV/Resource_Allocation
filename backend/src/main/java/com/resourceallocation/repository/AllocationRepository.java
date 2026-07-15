package com.resourceallocation.repository;

import com.resourceallocation.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {

    @Query("SELECT a FROM Allocation a WHERE " +
           "(:employeeName IS NULL OR :employeeName = '' OR LOWER(a.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND " +
           "(:projectName IS NULL OR :projectName = '' OR LOWER(a.project.projectName) LIKE LOWER(CONCAT('%', :projectName, '%'))) AND " +
           "(:roleInProject IS NULL OR :roleInProject = '' OR a.roleInProject = :roleInProject) AND " +
           "(:allocationPercent IS NULL OR a.allocationPercent = :allocationPercent)")
    Page<Allocation> filterAllocations(
            @Param("employeeName") String employeeName,
            @Param("projectName") String projectName,
            @Param("roleInProject") String roleInProject,
            @Param("allocationPercent") Integer allocationPercent,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.allocationPercent), 0) FROM Allocation a WHERE a.employee.employeeId = :employeeId")
    Integer sumAllocationByEmployeeId(@Param("employeeId") Long employeeId);

    List<Allocation> findByEmployee_EmployeeId(Long employeeId);

    List<Allocation> findByProject_ProjectId(Long projectId);

    boolean existsByEmployee_EmployeeId(Long employeeId);

    boolean existsByProject_ProjectId(Long projectId);
}
