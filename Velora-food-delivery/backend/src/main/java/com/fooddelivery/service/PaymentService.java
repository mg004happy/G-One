package com.fooddelivery.service;

import com.fooddelivery.dto.PaymentResponse;
import com.fooddelivery.dto.PaymentRequest;
import com.fooddelivery.dto.PaymentVerificationRequest;

/**
 * Service interface for payment operations.
 */
public interface PaymentService {

    /**
     * Create a payment record for an order.
     * For CASH_ON_DELIVERY, payment stays PENDING until delivery.
     * For ONLINE_PAYMENT, a simulated payment ID is generated for later verification.
     *
     * @param orderId the order to pay for
     * @param request the payment method
     * @return the created payment
     */
    PaymentResponse createPayment(Long orderId, PaymentRequest request);

    /**
     * Verify/confirm a simulated online payment.
     * Updates payment status to PAID or FAILED and syncs the order's paymentStatus.
     *
     * @param request contains paymentId, transactionId, and success flag
     * @return the updated payment
     */
    PaymentResponse verifyPayment(PaymentVerificationRequest request);

    /**
     * Get payment details by payment ID.
     *
     * @param paymentId the system-generated payment ID
     * @return the payment details
     */
    PaymentResponse getPaymentByPaymentId(String paymentId);

}
