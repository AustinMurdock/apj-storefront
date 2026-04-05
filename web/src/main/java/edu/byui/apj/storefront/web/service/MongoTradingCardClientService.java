package edu.byui.apj.storefront.web.service;

import edu.byui.apj.storefront.web.model.TradingCardDTO;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

@Service
public class MongoTradingCardClientService {

    private final WebClient webClient;

    public MongoTradingCardClientService(@Qualifier("tradingCardClient") WebClient tradingCardClient) {
        this.webClient = tradingCardClient;
    }

    public List<TradingCardDTO> getAll(String sort, int page, int size) {
        return webClient.get()
            .uri(uriBuilder -> {
                UriBuilder builder = uriBuilder.path("/api/trading-cards")
                    .queryParam("page", page)
                    .queryParam("size", size);
                if (sort != null && !sort.isBlank()) {
                    builder.queryParam("sort", sort);
                }
                return builder.build();
            })
            .retrieve()
            .bodyToFlux(TradingCardDTO.class)
            .collectList()
            .block();
    }

    public List<TradingCardDTO> getFeatured(String q) {
        return webClient.get()
            .uri(uriBuilder -> {
                UriBuilder builder = uriBuilder.path("/api/trading-cards/featured");
                if (q != null && !q.isBlank()) {
                    builder.queryParam("q", q);
                }
                return builder.build();
            })
            .retrieve()
            .bodyToFlux(TradingCardDTO.class)
            .collectList()
            .block();
    }

    public List<String> getSpecialties() {
        return webClient.get()
            .uri("/api/trading-cards/specialties")
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
            .block();
    }

    public Optional<TradingCardDTO> getById(String id) {
        return webClient.get()
            .uri("/api/trading-cards/{id}", id)
            .exchangeToMono(response -> {
                if (response.statusCode() == HttpStatus.NOT_FOUND) {
                    return Mono.just(Optional.<TradingCardDTO>empty());
                }
                return response.bodyToMono(TradingCardDTO.class).map(Optional::of);
            })
            .block();
    }

    public List<TradingCardDTO> filterBySpecialty(String specialty) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder.path("/api/trading-cards/filter/specialty")
                .queryParam("specialty", specialty)
                .build()
            )
            .retrieve()
            .bodyToFlux(TradingCardDTO.class)
            .collectList()
            .block();
    }

    public List<TradingCardDTO> filterByPrice(double minPrice, double maxPrice) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder.path("/api/trading-cards/filter/price")
                .queryParam("minPrice", minPrice)
                .queryParam("maxPrice", maxPrice)
                .build()
            )
            .retrieve()
            .bodyToFlux(TradingCardDTO.class)
            .collectList()
            .block();
    }

    public List<TradingCardDTO> search(String query) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder.path("/api/trading-cards/search")
                .queryParam("query", query)
                .build()
            )
            .retrieve()
            .bodyToFlux(TradingCardDTO.class)
            .collectList()
            .block();
    }
}
