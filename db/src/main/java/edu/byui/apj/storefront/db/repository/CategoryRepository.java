package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {}
