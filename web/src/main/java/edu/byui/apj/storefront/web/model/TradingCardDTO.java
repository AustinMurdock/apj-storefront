package edu.byui.apj.storefront.web.model;

public record TradingCardDTO(
    String id,
    String name,
    String specialty,
    String contribution,
    double price,
    String imageUrl
) {}
