package edu.byui.apj.storefront.db.config;

import edu.byui.apj.storefront.db.model.Category;
import edu.byui.apj.storefront.db.model.Product;
import edu.byui.apj.storefront.db.model.User;
import edu.byui.apj.storefront.db.model.UserProfile;
import edu.byui.apj.storefront.db.repository.CategoryRepository;
import edu.byui.apj.storefront.db.repository.ProductRepository;
import edu.byui.apj.storefront.db.repository.UserProfileRepository;
import edu.byui.apj.storefront.db.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserProfileRepository userProfileRepository;

    public DataSeeder(
        UserRepository userRepository,
        ProductRepository productRepository,
        CategoryRepository categoryRepository,
        UserProfileRepository userProfileRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0 || productRepository.count() > 0) {
            log.info("Demo data already present, skipping seeding.");
            return;
        }

        User u1 = new User();
        u1.setUsername("jane.doe");
        UserProfile p1 = new UserProfile();
        p1.setFirstName("Jane");
        p1.setLastName("Doe");
        u1.setProfile(p1);
        userRepository.save(u1);
        userProfileRepository.save(p1);

        User u2 = new User();
        u2.setUsername("john.smith");
        UserProfile p2 = new UserProfile();
        p2.setFirstName("John");
        p2.setLastName("Smith");
        u2.setProfile(p2);
        userRepository.save(u2);
        userProfileRepository.save(p2);

        Category electronics = new Category(); electronics.setName("Electronics");
        Category mobile = new Category(); mobile.setName("Mobile");

        Product phone = new Product(); phone.setName("Cool EpicPhone");
        phone.getCategories().add(electronics);
        phone.getCategories().add(mobile);

        Product tablet = new Product(); tablet.setName("Mini Flatscreen");
        tablet.getCategories().add(electronics);

        productRepository.save(phone);
        productRepository.save(tablet);

        log.info(
            "Seeding complete. Users: {}, Products: {}, Categories: {}",
            userRepository.count(), productRepository.count(), categoryRepository.count()
        );
    }
}
