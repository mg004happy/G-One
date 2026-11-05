package com.fooddelivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class FoodDeliveryApplication {

    @Bean
    ApplicationRunner dropSingleRestaurantPerOwnerConstraint(JdbcTemplate jdbcTemplate) {
        return args -> jdbcTemplate.execute(
                "ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS uk_restaurants_owner_id");
    }

    public static void main(String[] args) {
        SpringApplication.run(FoodDeliveryApplication.class, args);
    }
}
