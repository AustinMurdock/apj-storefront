package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {}
