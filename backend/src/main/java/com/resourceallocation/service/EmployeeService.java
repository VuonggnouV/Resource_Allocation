package com.resourceallocation.service;

import com.resourceallocation.request.EmployeeRequest;
import com.resourceallocation.entity.Employee;
import com.resourceallocation.exception.EmployeeNotFoundException;
import com.resourceallocation.repository.EmployeeRepository;
import com.resourceallocation.repository.AllocationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final AllocationRepository allocationRepository;

    public EmployeeService(EmployeeRepository employeeRepository, AllocationRepository allocationRepository) {
        this.employeeRepository = employeeRepository;
        this.allocationRepository = allocationRepository;
    }

    public Employee create(EmployeeRequest request) {
        Employee employee = new Employee();
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment());
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = findById(id);
        
        // Kiểm tra mã nhân sự trùng với người khác
        employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .ifPresent(existing -> {
                    if (!existing.getEmployeeId().equals(id)) {
                        throw new RuntimeException("Mã nhân sự '" + request.getEmployeeCode() + "' đã được sử dụng bởi nhân viên khác.");
                    }
                });

        // Kiểm tra email trùng với người khác
        employeeRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getEmployeeId().equals(id)) {
                        throw new RuntimeException("Email '" + request.getEmail() + "' đã được đăng ký bởi nhân viên khác.");
                    }
                });

        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment());
        return employeeRepository.save(employee);
    }

    @Transactional
    public void delete(Long id) {
        Employee employee = findById(id);
        if (allocationRepository.existsByEmployee_EmployeeId(id)) {
            throw new RuntimeException("Không thể xóa nhân viên này vì đang có lịch phân bổ hoạt động trong dự án.");
        }
        employeeRepository.delete(employee);
    }

    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    public Page<Employee> findAll(String employeeCode, String fullName, String email, String role, String department, String sortBy, String sortDir, Pageable pageable) {
        String cleanCode = (employeeCode == null) ? "" : employeeCode.trim();
        String cleanName = (fullName == null) ? "" : fullName.trim();
        String cleanEmail = (email == null) ? "" : email.trim();
        String cleanRole = (role == null || "ALL".equalsIgnoreCase(role.trim())) ? "" : role.trim();
        String cleanDept = (department == null || "ALL".equalsIgnoreCase(department.trim())) ? "" : department.trim();

        if ("workload".equalsIgnoreCase(sortBy)) {
            if ("desc".equalsIgnoreCase(sortDir)) {
                return employeeRepository.filterEmployeesOrderByWorkloadDesc(cleanCode, cleanName, cleanEmail, cleanRole, cleanDept, pageable);
            } else {
                return employeeRepository.filterEmployeesOrderByWorkloadAsc(cleanCode, cleanName, cleanEmail, cleanRole, cleanDept, pageable);
            }
        }
        return employeeRepository.filterEmployees(cleanCode, cleanName, cleanEmail, cleanRole, cleanDept, pageable);
    }

    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }
}
