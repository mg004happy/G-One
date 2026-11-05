package com.fooddelivery.repository;

import com.fooddelivery.entity.Address;
import com.fooddelivery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Address} entities.
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * Find all addresses belonging to a user, default address first.
     */
    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    /**
     * Find the default address for a user.
     */
    Optional<Address> findByUserAndIsDefaultTrue(User user);

    /**
     * Clear the default flag on all addresses for a user.
     * Called before setting a new default.
     */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user = :user")
    void clearDefaultForUser(@Param("user") User user);
}
