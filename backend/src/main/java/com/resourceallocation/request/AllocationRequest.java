package com.resourceallocation.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllocationRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Allocation percent is required")
    @Min(value = 1, message = "Allocation percent must be greater than 0")
    @Max(value = 100, message = "Allocation percent must be less than or equal to 100")
    private Integer allocationPercent;

    @NotBlank(message = "Role in project is required")
    private String roleInProject;
    
    private LocalDate startDate;

    private LocalDate endDate;
}
