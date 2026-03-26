package edu.byui.apj.storefront.api.service;

import edu.byui.apj.storefront.api.data.CsvCardRepository;
import edu.byui.apj.storefront.api.model.Card;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CardService {

    private static final Logger logger = LoggerFactory.getLogger(CardService.class);

    private final CsvCardRepository repo;

    public CardService(CsvCardRepository repo) {
        this.repo = repo;
    }

    public List<Card> getFeaturedCards(String q) {
        String effective = (q == null || q.isBlank()) ? "Java " : q;
        logger.debug("Fetching featured cards with query: {}", effective);
        return repo.search(effective);
    }

    public List<Card> getAll() {
        logger.debug("Fetching all cards");
        return repo.findAll();
    }

    public Optional<Card> getById(Long id) {
        logger.debug("Fetching cards by id {}", id);
        return repo.findById(id);
    }
}
