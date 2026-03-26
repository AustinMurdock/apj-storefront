package edu.byui.apj.storefront.web.controller;

import edu.byui.apj.storefront.web.model.Card;
import edu.byui.apj.storefront.web.service.WebCardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProxyCardController {

    private final WebCardService webCardService;

    public ProxyCardController(WebCardService webCardService) {
        this.webCardService = webCardService;
    }

    @GetMapping("/api/cards/featured")
    public List<Card> featured(@RequestParam(required = false) String q) {
        return webCardService.getFeatured(q);
    }

    @GetMapping("/api/cards")
    public List<Card> all(@RequestParam(required = false) String q) {
        return webCardService.search(q);
    }

    @GetMapping("/api/cards/{id}")
    public ResponseEntity<Card> byId(@PathVariable Long id) {
        return webCardService.getCardById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
