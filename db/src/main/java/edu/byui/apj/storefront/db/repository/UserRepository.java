package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {}
