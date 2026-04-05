package edu.byui.apj.storefront.apimongo.controller;

import edu.byui.apj.storefront.apimongo.mongo.TradingCard;
import edu.byui.apj.storefront.apimongo.service.TradingCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading-cards")
@Tag(name = "Trading Cards", description = "Operations related to trading cards")
public class TradingCardController {

    private final TradingCardService tradingCardService;

    public TradingCardController(TradingCardService tradingCardService) {
        this.tradingCardService = tradingCardService;
    }

    @Operation(summary = "Get all trading cards", description = "Returns a paginated list of trading cards. Supports optional sort by name or price.")
    @GetMapping
    public List<TradingCard> getAll(
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return tradingCardService.findAll(sort, page, size);
    }

    @Operation(summary = "Get featured cards", description = "Returns cards matching the query. Defaults to Java if no query provided.")
    @GetMapping("/featured")
    public List<TradingCard> getFeatured(@RequestParam(required = false) String q) {
        return tradingCardService.getFeatured(q);
    }

    @Operation(summary = "Get a single card by ID", description = "Returns a trading card by ID. Returns a 404 error if the specified card is not found.")
    @GetMapping("/{id}")
    public ResponseEntity<TradingCard> getById(@PathVariable String id) {
        return tradingCardService.getById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "List distinct specialties", description = "Returns all distinct specialty values from trading cards.")
    @GetMapping("/specialties")
    public List<String> getSpecialties() {
        return tradingCardService.getDistinctSpecialties();
    }

    @Operation(summary = "Filter by specialty", description = "Returns trading cards matching given specialty.")
    @GetMapping("/filter/specialty")
    public List<TradingCard> filterBySpecialty(@RequestParam String specialty) {
        return tradingCardService.filterBySpecialty(specialty);
    }

    @Operation(summary = "Filter by price range", description = "Returns trading cards within specified min and max price.")
    @GetMapping("/filter/price")
    public List<TradingCard> filterByPrice(@RequestParam double minPrice, @RequestParam double maxPrice) {
        return tradingCardService.filterByPrice(minPrice, maxPrice);
    }

    @Operation(summary = "Search trading cards", description = "Returns trading cards matching search query in name or contribution.")
    @GetMapping("/search")
    public List<TradingCard> search(@RequestParam String query) {
        return tradingCardService.search(query);
    }
}
