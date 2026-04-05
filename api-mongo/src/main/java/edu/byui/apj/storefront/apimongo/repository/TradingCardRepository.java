package edu.byui.apj.storefront.apimongo.repository;

import edu.byui.apj.storefront.apimongo.mongo.TradingCard;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TradingCardRepository extends MongoRepository<TradingCard, String> {

    List<TradingCard> findBySpecialty(String specialty);

    List<TradingCard> findByPriceBetween(double min, double max);

    List<TradingCard> findByNameContainingIgnoreCaseOrContributionContainingIgnoreCase(String name, String contribution);
}
