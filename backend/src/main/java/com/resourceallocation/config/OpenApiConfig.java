package com.resourceallocation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Resource Allocation Management System API")
                        .version("1.0.0")
                        .description("API Documentation for Resource Allocation Management System backend with reporting and mock AI capabilities."));
    }
}
