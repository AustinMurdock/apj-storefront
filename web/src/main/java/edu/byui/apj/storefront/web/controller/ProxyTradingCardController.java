package edu.byui.apj.storefront.web.controller;

import edu.byui.apj.storefront.web.model.TradingCardDTO;
import edu.byui.apj.storefront.web.service.MongoTradingCardClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trading-cards")
public class ProxyTradingCardController {

    private final MongoTradingCardClientService tradingCardService;

    public ProxyTradingCardController(MongoTradingCardClientService tradingCardService) {
        this.tradingCardService = tradingCardService;
    }

    @GetMapping
    public List<TradingCardDTO> getAll(
        @RequestParam(required = false) String sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "8") int size
    ) {
        return tradingCardService.getAll(sort, page, size);
    }

    @GetMapping("/featured")
    public List<TradingCardDTO> getFeatured(@RequestParam(required = false) String q) {
        return tradingCardService.getFeatured(q);
    }

    @GetMapping("/specialties")
    public List<String> getSpecialties() {
        return tradingCardService.getSpecialties();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TradingCardDTO> getById(@PathVariable String id) {
        return tradingCardService.getById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/filter/specialty")
    public List<TradingCardDTO> filterBySpecialty(@RequestParam String specialty) {
        return tradingCardService.filterBySpecialty(specialty);
    }

    @GetMapping("/filter/price")
    public List<TradingCardDTO> filterByPrice(
        @RequestParam double minPrice,
        @RequestParam double maxPrice
    ) {
        return tradingCardService.filterByPrice(minPrice, maxPrice);
    }

    @GetMapping("/search")
    public List<TradingCardDTO> search(@RequestParam String query) {
        return tradingCardService.search(query);
    }
}
