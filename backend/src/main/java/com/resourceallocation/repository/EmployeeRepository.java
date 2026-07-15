package com.resourceallocation.repository;

import com.resourceallocation.entity.Employee;
import com.resourceallocation.dto.AvailableResourceDTO;
import com.resourceallocation.dto.OverloadedResourceDTO;
import com.resourceallocation.dto.RecommendedResourceDTO;
import com.resourceallocation.dto.UtilizationReportDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    java.util.Optional<Employee> findByEmployeeCode(String employeeCode);

    java.util.Optional<Employee> findByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:employeeCode IS NULL OR :employeeCode = '' OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :employeeCode, '%'))) AND " +
           "(:fullName IS NULL OR :fullName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) AND " +
           "(:email IS NULL OR :email = '' OR LOWER(e.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR :role = '' OR e.role = :role) AND " +
           "(:department IS NULL OR :department = '' OR e.department = :department)")
    Page<Employee> filterEmployees(
            @Param("employeeCode") String employeeCode,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("role") String role,
            @Param("department") String department,
            Pageable pageable);

    @Query("SELECT new com.resourceallocation.dto.UtilizationReportDTO(e.employeeId, e.fullName, COALESCE(SUM(a.allocationPercent), 0L)) " +
           "FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "GROUP BY e.employeeId, e.fullName")
    List<UtilizationReportDTO> getUtilizationReport();

    @Query("SELECT new com.resourceallocation.dto.AvailableResourceDTO(e.employeeId, e.fullName, e.role, 100 - COALESCE(SUM(a.allocationPercent), 0L)) " +
           "FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "GROUP BY e.employeeId, e.fullName, e.role " +
           "HAVING COALESCE(SUM(a.allocationPercent), 0L) < 100L")
    List<AvailableResourceDTO> getAvailableResources();

    @Query("SELECT new com.resourceallocation.dto.OverloadedResourceDTO(e.employeeId, e.fullName, SUM(a.allocationPercent)) " +
           "FROM Employee e JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "GROUP BY e.employeeId, e.fullName " +
           "HAVING SUM(a.allocationPercent) > 90L")
    List<OverloadedResourceDTO> getOverloadedEmployees();

    @Query("SELECT new com.resourceallocation.dto.RecommendedResourceDTO(e.fullName, 100 - COALESCE(SUM(a.allocationPercent), 0L)) " +
           "FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "WHERE LOWER(e.role) LIKE LOWER(CONCAT('%', :role, '%')) " +
           "GROUP BY e.employeeId, e.fullName, e.role " +
           "HAVING (100 - COALESCE(SUM(a.allocationPercent), 0L)) >= :minAvailable")
    List<RecommendedResourceDTO> recommendResources(
            @Param("role") String role, 
            @Param("minAvailable") Long minAvailable);


//  For AI
    @Query("SELECT new com.resourceallocation.dto.AvailableResourceDTO(e.employeeId, e.fullName, e.role, 100 - COALESCE(SUM(a.allocationPercent), 0L)) " +
           "FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "WHERE LOWER(e.role) LIKE LOWER(CONCAT('%', :role, '%')) " +
           "GROUP BY e.employeeId, e.fullName, e.role")
    List<AvailableResourceDTO> getAvailableResourcesByRole(
            @Param("role") String role);


    @Query("SELECT e FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId " +
           "GROUP BY e.employeeId, e.employeeCode, e.fullName, e.email, e.role, e.department, e.createdAt " +
           "HAVING COALESCE(SUM(a.allocationPercent), 0) = 0")
    List<Employee> getIdleEmployees();

    @Query("SELECT e FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId WHERE " +
           "(:employeeCode IS NULL OR :employeeCode = '' OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :employeeCode, '%'))) AND " +
           "(:fullName IS NULL OR :fullName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) AND " +
           "(:email IS NULL OR :email = '' OR LOWER(e.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR :role = '' OR e.role = :role) AND " +
           "(:department IS NULL OR :department = '' OR e.department = :department) " +
           "GROUP BY e.employeeId, e.employeeCode, e.fullName, e.email, e.role, e.department, e.createdAt " +
           "ORDER BY COALESCE(SUM(a.allocationPercent), 0) ASC")
    Page<Employee> filterEmployeesOrderByWorkloadAsc(
            @Param("employeeCode") String employeeCode,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("role") String role,
            @Param("department") String department,
            Pageable pageable);

    @Query("SELECT e FROM Employee e LEFT JOIN Allocation a ON e.employeeId = a.employee.employeeId WHERE " +
           "(:employeeCode IS NULL OR :employeeCode = '' OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :employeeCode, '%'))) AND " +
           "(:fullName IS NULL OR :fullName = '' OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :fullName, '%'))) AND " +
           "(:email IS NULL OR :email = '' OR LOWER(e.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR :role = '' OR e.role = :role) AND " +
           "(:department IS NULL OR :department = '' OR e.department = :department) " +
           "GROUP BY e.employeeId, e.employeeCode, e.fullName, e.email, e.role, e.department, e.createdAt " +
           "ORDER BY COALESCE(SUM(a.allocationPercent), 0) DESC")
    Page<Employee> filterEmployeesOrderByWorkloadDesc(
            @Param("employeeCode") String employeeCode,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("role") String role,
            @Param("department") String department,
            Pageable pageable);
}
