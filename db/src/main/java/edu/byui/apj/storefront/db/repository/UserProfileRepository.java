package edu.byui.apj.storefront.db.repository;

import edu.byui.apj.storefront.db.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {}
