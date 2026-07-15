package com.resourceallocation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resourceallocation.dto.AvailableResourceDTO;
import com.resourceallocation.dto.RecommendedResourceDTO;
import com.resourceallocation.repository.EmployeeRepository;
import com.resourceallocation.repository.ProjectRepository;
import com.resourceallocation.repository.AllocationRepository;
import com.resourceallocation.entity.Project;
import com.resourceallocation.entity.Allocation;
import com.resourceallocation.response.AiCopilotResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRepository allocationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String modelName;

    public AiService(EmployeeRepository employeeRepository,
                     ProjectRepository projectRepository,
                     AllocationRepository allocationRepository) {
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.allocationRepository = allocationRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AiCopilotResponse askCopilot(String prompt) {
        log.info("Processing Unified AI Copilot prompt: \"{}\"", prompt);

        if (isApiKeyMissing()) {
            log.warn("Gemini API Key is not configured. Returning instruction message.");
            return new AiCopilotResponse(
                "text", 
                null, 
                null, 
                "Vui lòng cấu hình 'gemini.api.key' trong file application.properties để kích hoạt AI thực tế."
            );
        }

        try {
            // 1. Lấy toàn bộ danh sách nhân sự thực tế từ DB
            List<AvailableResourceDTO> allEmployees = employeeRepository.getAvailableResourcesByRole("");
            String employeesJson = objectMapper.writeValueAsString(allEmployees);

            // Lấy danh sách dự án thực tế
            List<Project> allProjects = projectRepository.findAll();
            String projectsJson = objectMapper.writeValueAsString(allProjects);

            // Lấy danh sách phân bổ thô tối giản
            List<Map<String, Object>> cleanAllocs = new ArrayList<>();
            for (Allocation a : allocationRepository.findAll()) {
                Map<String, Object> m = new HashMap<>();
                m.put("employeeName", a.getEmployee() != null ? a.getEmployee().getFullName() : "N/A");
                m.put("projectName", a.getProject() != null ? a.getProject().getProjectName() : "N/A");
                m.put("roleInProject", a.getRoleInProject());
                m.put("allocationPercent", a.getAllocationPercent());
                m.put("startDate", a.getStartDate());
                m.put("endDate", a.getEndDate());
                cleanAllocs.add(m);
            }
            String allocationsJson = objectMapper.writeValueAsString(cleanAllocs);

            // 2. Xây dựng prompt gửi lên Gemini tự động phân tích ngữ cảnh
            String systemInstruction = 
                    "You are RAMS AI Assistant, a smart assistant for the Resource Allocation Management System. "
                    + "Below is the real data from our database:\n\n"
                    + "=== EMPLOYEES AND WORKLOAD ===\n"
                    + employeesJson + "\n\n"
                    + "=== PROJECTS ===\n"
                    + projectsJson + "\n\n"
                    + "=== CURRENT ALLOCATIONS ===\n"
                    + allocationsJson + "\n\n"
                    + "Analyze the user input: '" + prompt + "'. "
                    + "If the user is asking to recommend, suggest, or find employees (e.g. 'tìm nhân sự', 'gợi ý dev', 'ai rảnh >50%', 'find angular dev', etc.), you must match employees from the list. "
                    + "For this recommendation mode, reply in a strict JSON format matching this structure:\n"
                    + "{ \"mode\": \"recommend\", \"recommendedResources\": [ { \"employee\": \"FullName\", \"available\": available_percentage_as_number } ], \"text\": \"Dưới đây là các nhân sự khả dụng tôi gợi ý cho anh:\" }\n"
                    + "If the user is asking to analyze resource risks, workload issues, capacity check for a project/sprint (e.g. 'sprint tới cần thêm 2 dev', 'check rủi ro dự án', etc.), "
                    + "you must compute capacity and evaluate risk. For this risk mode, reply in a strict JSON format matching this structure:\n"
                    + "{ \"mode\": \"risk\", \"risk\": [ \"Risk description 1 in Vietnamese\", \"Risk description 2 in Vietnamese\" ], \"text\": \"Tôi đã phân tích các rủi ro nguồn lực như sau:\" }\n"
                    + "For any other general questions, greetings, explanations, project status, or allocation history queries, reply in a strict JSON format matching this structure:\n"
                    + "{ \"mode\": \"text\", \"text\": \"Your natural language response here in Vietnamese based on the database data provided above.\" }\n"
                    + "Return ONLY the raw JSON string. Do not wrap it in ```json code blocks or include any extra text. Your output must be parseable as a valid JSON.";

            String geminiResponseText = callGeminiApi(systemInstruction);
            log.info("Gemini raw response text: {}", geminiResponseText);

            // 3. Parse kết quả trả về từ Gemini
            JsonNode rootNode = objectMapper.readTree(geminiResponseText);
            String mode = rootNode.path("mode").asText("text");
            String responseText = rootNode.path("text").asText("Tôi không thể xử lý yêu cầu vào lúc này.");

            List<RecommendedResourceDTO> recommendedResources = null;
            List<String> risk = null;

            if ("recommend".equalsIgnoreCase(mode)) {
                recommendedResources = new ArrayList<>();
                JsonNode resourcesNode = rootNode.path("recommendedResources");
                if (resourcesNode.isArray()) {
                    for (JsonNode node : resourcesNode) {
                        String employeeName = node.path("employee").asText();
                        Long available = node.path("available").asLong();
                        recommendedResources.add(new RecommendedResourceDTO(employeeName, available));
                    }
                }
            } else if ("risk".equalsIgnoreCase(mode)) {
                risk = new ArrayList<>();
                JsonNode riskNode = rootNode.path("risk");
                if (riskNode.isArray()) {
                    for (JsonNode node : riskNode) {
                        risk.add(node.asText());
                    }
                } else {
                    risk.add("Không phát hiện rủi ro nào đáng kể.");
                }
            }

            return new AiCopilotResponse(mode, recommendedResources, risk, responseText);

        } catch (Exception e) {
            log.error("Error invoking Gemini AI API for Copilot", e);
            return new AiCopilotResponse(
                "text", 
                null, 
                null, 
                "Lỗi kết nối AI: " + e.getMessage()
            );
        }
    }

    private boolean isApiKeyMissing() {
        return apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_GEMINI_API_KEY");
    }

    private String cleanJsonResponse(String rawResponse) {
        String clean = rawResponse.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String callGeminiApi(String prompt) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1/models/" + modelName + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(part);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(content);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        String responseStr = restTemplate.postForObject(url, requestEntity, String.class);

        JsonNode responseJson = objectMapper.readTree(responseStr);
        String textResult = responseJson
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text").asText();

        return cleanJsonResponse(textResult);
    }
}
