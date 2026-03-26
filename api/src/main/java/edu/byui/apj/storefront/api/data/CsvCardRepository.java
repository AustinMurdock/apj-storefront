package edu.byui.apj.storefront.api.data;

import jakarta.annotation.PostConstruct;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.opencsv.CSVReader;
import edu.byui.apj.storefront.api.model.Card;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

/**
 * Loads cards from classpath resource data/pioneers.csv into memory on startup.
 *
 * Important:
 * - This loader expects the CSV header to contain EXACT names (case-sensitive):
 *   "ID","Name","Specialty","Contribution","Price","ImageUrl"
 * - If column names differ, update the CSV or this mapping.
 *
 * Educational: this demonstrates loading resources from classpath and mapping CSV
 * rows into POJOs. Keep this simple for the tutorial (in-memory, read-only).
 */
@Repository
public class CsvCardRepository {

    private final List<Card> cards = new ArrayList<>();

    @PostConstruct
    public void loadCsv() {
        try {
            ClassPathResource resource = new ClassPathResource("data/pioneers.csv");
            try (Reader reader = new InputStreamReader(resource.getInputStream());
                 CSVReader csv = new CSVReader(reader)) {

                String[] headers = csv.readNext();
                if (headers == null) {
                    // empty CSV
                    return;
                }

                // Map header (exact case-sensitive) -> index
                Map<String, Integer> headerIndex = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    if (headers[i] != null) {
                        headerIndex.put(headers[i].trim(), i);
                    }
                }

                // Verify required headers exist; if not, fail early with a helpful message
                List<String> required = Arrays.asList("ID", "Name", "Specialty", "Contribution", "Price", "ImageUrl");
                List<String> missing = required.stream().filter(h -> !headerIndex.containsKey(h)).toList();
                if (!missing.isEmpty()) {
                    throw new IllegalStateException("pioneers.csv missing required headers: " + missing + ". Headers found: " + Arrays.toString(headers));
                }

                String[] row;
                while ((row = csv.readNext()) != null) {
                    // Safely read columns by their exact header names
                    Long id = parseLongSafe( getValue(row, headerIndex, "ID") );
                    String name = getValue(row, headerIndex, "Name");
                    String specialty = getValue(row, headerIndex, "Specialty");
                    String contribution = getValue(row, headerIndex, "Contribution");
                    BigDecimal price = parseBigDecimalSafe( getValue(row, headerIndex, "Price") );
                    String imageUrl = getValue(row, headerIndex, "ImageUrl");

                    Card c = new Card(id, name, specialty, contribution, price, imageUrl);
                    cards.add(c);
                }
            }
        } catch (Exception ex) {
            throw new RuntimeException("Failed to load CSV 'data/pioneers.csv' from classpath", ex);
        }
    }

    private String getValue(String[] row, Map<String,Integer> headerIndex, String key) {
        Integer i = headerIndex.get(key);
        if (i == null || i >= row.length) return null;
        String s = row[i];
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private Long parseLongSafe(String s) {
        if (s == null) return null;
        try { return Long.parseLong(s.replaceAll("[^0-9]", "")); }
        catch (Exception e) { return null; }
    }

    private BigDecimal parseBigDecimalSafe(String s) {
        if (s == null) return null;
        try {
            // Remove currency symbols/commas if present
            String cleaned = s.replaceAll("[^0-9.\\-]", "");
            if (cleaned.isBlank()) return null;
            return new BigDecimal(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Return an unmodifiable list of all cards.
     */
    public List<Card> findAll() {
        return Collections.unmodifiableList(cards);
    }

    /**
     * Search across name, specialty, contribution (case-insensitive). Price & imageUrl not searched.
     */
    public List<Card> search(String q) {
        if (q == null || q.isBlank()) return findAll();
        String term = q.toLowerCase();
        return cards.stream()
                .filter(c ->
                        (c.getName() != null && c.getName().toLowerCase().contains(term))
                                || (c.getSpecialty() != null && c.getSpecialty().toLowerCase().contains(term))
                                || (c.getContribution() != null && c.getContribution().toLowerCase().contains(term))
                )
                .collect(Collectors.toList());
    }

    public Optional<Card> findById(Long id) {
        return cards.stream().filter(c -> Objects.equals(c.getId(), id)).findFirst();
    }
}