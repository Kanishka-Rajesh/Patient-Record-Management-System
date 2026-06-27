package com.karthick.patientrecordmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; " +
                                                "script-src 'self' 'unsafe-inline'; " +
                                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                                "font-src 'self' https://fonts.gstatic.com; " +
                                                "connect-src 'self' http://127.0.0.1:8080 http://localhost:8080;"
                                )
                        )
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://127.0.0.1:5000", "http://localhost:5000","http://127.0.0.1:5001", "http://localhost:5001"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
