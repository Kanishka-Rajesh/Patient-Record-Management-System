package com.karthick.patientrecordmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow all paths
                .allowedOrigins("http://127.0.0.1:5000","http://127.0.0.1:5001" ) // Allow your frontend's URL
                .allowedMethods("GET", "POST", "PUT", "DELETE") // Allowed HTTP methods
                .allowedHeaders("*"); // Allow all headers
    }
}

