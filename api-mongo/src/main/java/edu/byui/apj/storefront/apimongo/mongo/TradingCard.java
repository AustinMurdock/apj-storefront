package edu.byui.apj.storefront.apimongo.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "tradingCards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradingCard {

    @Id private String id;
    @Field("ID") private Long idNumber;
    @Field("Name") private String name;
    @Field("Specialty") private String specialty;
    @Field("Contribution") private String contribution;
    @Field("Price") private double price;
    @Field("ImageUrl") private String imageUrl;

}
