package edu.byui.apj.storefront.web.service;

import edu.byui.apj.storefront.web.data.CsvCardRepository;
import edu.byui.apj.storefront.web.model.Card;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class CardService {

    private final CsvCardRepository repo;

    public CardService(CsvCardRepository repo) {
        this.repo = repo;
    }

    public List<Card> getFeaturedCards(String q) {
        String effective = (q == null || q.isBlank()) ? "Java " : q;
        return repo.search(effective);
    }

    public List<Card> getAll() {
        return repo.findAll();
    }

    public Optional<Card> getById(Long id) {
        return repo.findById(id);
    }
}
