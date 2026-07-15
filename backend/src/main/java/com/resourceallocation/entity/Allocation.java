package com.resourceallocation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "allocation")
@Getter
@Setter
@NoArgsConstructor
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "allocation_percent", nullable = false)
    private Integer allocationPercent;

    @Column(name = "role_in_project", nullable = false, length = 100)
    private String roleInProject;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Allocation(Employee employee, Project project, Integer allocationPercent, String roleInProject, LocalDate startDate, LocalDate endDate) {
        this.employee = employee;
        this.project = project;
        this.allocationPercent = allocationPercent;
        this.roleInProject = roleInProject;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
