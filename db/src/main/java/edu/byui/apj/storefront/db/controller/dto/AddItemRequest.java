package edu.byui.apj.storefront.db.controller.dto;

public record AddItemRequest (
    Long productId,
    String name,
    Double price,
    Integer quantity
) {}
