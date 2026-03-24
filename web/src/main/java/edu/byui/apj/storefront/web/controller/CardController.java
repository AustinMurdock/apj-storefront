package edu.byui.apj.storefront.web.controller;

import edu.byui.apj.storefront.web.model.Card;
import edu.byui.apj.storefront.web.service.CardService;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService service;

    public CardController(CardService cardService) {
        this.service = cardService;
    }

    @GetMapping("/featured")
    public List<Card> featured(@RequestParam(required = false) String q) {
        return service.getFeaturedCards(q);
    }

    @GetMapping
    public List<Card> all() {
        return service.getAll();
    }

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
