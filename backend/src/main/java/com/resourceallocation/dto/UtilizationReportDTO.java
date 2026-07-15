package com.resourceallocation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UtilizationReportDTO {
    private Long employeeId;
    private String fullName;
    private Long totalAllocation;
}
