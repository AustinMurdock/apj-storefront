package edu.byui.apj.storefront.web.service;

import edu.byui.apj.storefront.web.model.Card;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class WebCardService {

    private static final Logger logger = LoggerFactory.getLogger(WebCardService.class);

    private final WebClient client;

    public WebCardService(WebClient cardApiClient) {
        this.client = cardApiClient;
    }

    private List<Card> getGeneric(String q, String defaultUri, String queryUri) {
        String uri = (q == null || q.isBlank()) ? defaultUri : queryUri + q;
        logger.debug("WebClient GET {}", uri);

        Flux<Card> flux = client.get()
                .uri(uri)
                .retrieve()
                .bodyToFlux(Card.class)
                .timeout(Duration.ofSeconds(5));

        return flux.collectList().block();
    }

    public List<Card> getFeatured(String q) {
        return getGeneric(q, "/api/cards/featured", "/api/cards/featured?q=");
    }

    public List<Card> search(String q) {
        return getGeneric(q, "/api/cards", "/api/cards?q=");
    }

    public Optional<Card> getCardById(Long id) {
        logger.debug("WebClient GET BY ID{}", id);
        Mono<Card> cardMono = client.get()
                .uri("/api/cards/" + id)
                .retrieve()
                .bodyToMono(Card.class);
        return cardMono.blockOptional();
    }
}
