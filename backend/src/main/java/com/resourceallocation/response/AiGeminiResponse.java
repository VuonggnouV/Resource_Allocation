package com.resourceallocation.response;

import com.resourceallocation.dto.RecommendedResourceDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiGeminiResponse {
    private String mode;
    private List<RecommendedResourceDTO> recommendedResources;
    private List<String> risk;
    private String text;
}
