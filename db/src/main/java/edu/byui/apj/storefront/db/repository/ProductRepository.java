package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {}
