package com.resourceallocation.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiGeminiRequest {
    @NotBlank(message = "Prompt cannot be blank")
    private String prompt;
}
