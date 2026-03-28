package edu.byui.apj.storefront.db.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue
    private Long id;

    private Long productId;
    private String name;
    private double price;
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;
}
