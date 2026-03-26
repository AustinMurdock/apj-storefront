package edu.byui.apj.storefront.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${card.api.base-url}")
    private String cardApiBaseUrl;

    @Bean
    public WebClient cardApiClient() {
        return WebClient.builder()
            .baseUrl(cardApiBaseUrl)
            .build();
    }
}
