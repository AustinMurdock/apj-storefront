package edu.byui.apj.storefront.web.controller;

import edu.byui.apj.storefront.web.model.Card;
import edu.byui.apj.storefront.web.service.CardService;
import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@Tag(name = "Cards", description = "Operations related to pioneer cards")
public class CardController {

    private final CardService service;

    public CardController(CardService cardService) {
        this.service = cardService;
    }

    @Operation(
        summary = "Get featured cards",
        description = "Returns cards matching the query. Defaults to Java if no query provided."
    )
    @GetMapping("/featured")
    public List<Card> featured(@RequestParam(required = false) String q) {
        return service.getFeaturedCards(q);
    }

    @Operation(summary = "Get all cards")
    @GetMapping
    public List<Card> all() {
        return service.getAll();
    }

    @Operation(
        summary = "Gets a single card by ID",
        description = "Returns a card by ID. Returns a 404 error if the specified card is not found."
    )
    @GetMapping("/{id}")
    public ResponseEntity<Card> byId(@PathVariable Long id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

//    @GetMapping("/whoami")
//    public String whoAmI(@RequestHeader("User-Agent") String userAgent) {
//        return "You are using: " + userAgent;
//    }
}
