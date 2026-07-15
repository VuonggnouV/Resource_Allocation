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
public class AiRecommendationResponse {
    private List<RecommendedResourceDTO> recommendedResources;
}
