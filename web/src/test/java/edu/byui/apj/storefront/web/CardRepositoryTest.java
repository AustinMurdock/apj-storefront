package edu.byui.apj.storefront.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import edu.byui.apj.storefront.web.service.CardService;
import java.util.List;
import edu.byui.apj.storefront.web.model.Card;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CardRepositoryTest {

    @Autowired
    CardService service;

    @Test
    void featured_hasJava() {
        List<Card> featured = service.getFeaturedCards(null);
        assertNotNull(featured, "Featured list should not be null");

        boolean anyJava = featured.stream().anyMatch(c ->
            containsIgnoreCase(c.getName(), "java") ||
            containsIgnoreCase(c.getSpecialty(), "java") ||
            containsIgnoreCase(c.getContribution(), "java")
        );

        assertTrue(anyJava, "No card contains 'Java' in name, specialty, or contribution - check CSV and search logic");
    }
    private static boolean containsIgnoreCase(String source, String sub) {
        if(source == null || sub == null) return false;
        return source.toLowerCase().contains(sub.toLowerCase());
    }
}
