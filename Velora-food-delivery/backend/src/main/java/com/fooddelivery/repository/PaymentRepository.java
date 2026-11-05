package com.fooddelivery.repository;

import com.fooddelivery.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Payment} entities.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Find a payment by its system-generated payment ID.
     */
    Optional<Payment> findByPaymentId(String paymentId);

    /**
     * Find the payment associated with a specific order.
     */
    Optional<Payment> findByOrderId(Long orderId);

}
