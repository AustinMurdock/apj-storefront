package edu.byui.apj.storefront.web.service;

import edu.byui.apj.storefront.web.model.Card;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CardService {

    public List<Card> getFeaturedCards() {
        return List.of(
            new Card("Ada Lovelace", "Algorithm Design"),
            new Card("Alannn Turing", "Computation Theory"),
            new Card("Grace Hopper", "Compiler Design")
        );
    }
}
