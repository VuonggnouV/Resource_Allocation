package com.resourceallocation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvailableResourceDTO {
    private Long employeeId;
    private String fullName;
    private String role;
    private Long availableAllocation;
}
