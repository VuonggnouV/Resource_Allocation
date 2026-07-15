package com.resourceallocation.controller;

import com.resourceallocation.request.AiGeminiRequest;
import com.resourceallocation.response.AiGeminiResponse;
import com.resourceallocation.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/gemini")
    public ResponseEntity<AiGeminiResponse> gemini(@Valid @RequestBody AiGeminiRequest request) {
        return ResponseEntity.ok(aiService.askGemini(request.getPrompt()));
    }
}
