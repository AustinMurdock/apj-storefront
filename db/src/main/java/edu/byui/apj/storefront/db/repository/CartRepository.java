package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {}