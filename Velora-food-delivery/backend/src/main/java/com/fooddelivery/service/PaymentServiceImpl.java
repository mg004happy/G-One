package com.fooddelivery.service;

import com.fooddelivery.dto.PaymentRequest;
import com.fooddelivery.dto.PaymentResponse;
import com.fooddelivery.dto.PaymentVerificationRequest;
import com.fooddelivery.entity.Order;
import com.fooddelivery.entity.Payment;
import com.fooddelivery.entity.PaymentMethod;
import com.fooddelivery.entity.PaymentStatus;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.InvalidPaymentException;
import com.fooddelivery.exception.OrderNotFoundException;
import com.fooddelivery.exception.PaymentNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedOrderAccessException;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.PaymentRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Implementation of {@link PaymentService}.
 *
 * <h3>Payment creation flow:</h3>
 * <ol>
 *   <li>Validate the order exists and belongs to the authenticated user.</li>
 *   <li>Check no existing payment already exists for this order.</li>
 *   <li>Generate a unique payment ID (e.g. PAY-20260527-ABC123).</li>
 *   <li>For CASH_ON_DELIVERY → status stays PENDING (paid on delivery).</li>
 *   <li>For ONLINE_PAYMENT → status stays PENDING until {@link #verifyPayment} is called.</li>
 * </ol>
 *
 * <h3>Payment verification flow (simulated):</h3>
 * <ol>
 *   <li>Look up the payment by its payment ID.</li>
 *   <li>If {@code success == true}, mark as PAID and record timestamp + transactionId.</li>
 *   <li>If {@code success == false}, mark as FAILED.</li>
 *   <li>Sync the order's {@code paymentStatus} field.</li>
 * </ol>
 */
@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              OrderRepository orderRepository,
                              UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PaymentResponse createPayment(Long orderId, PaymentRequest request) {
        User user = getAuthenticatedUser();

        // 1. Validate order exists and belongs to user
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(
                        "Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedOrderAccessException(
                    "You do not have permission to pay for this order");
        }

        // 2. Check no duplicate payment
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new InvalidPaymentException(
                    "A payment already exists for order: " + order.getOrderNumber());
        }

        // 3. Build payment
        Payment payment = Payment.builder()
                .paymentId(generatePaymentId())
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .amount(order.getTotalAmount())
                .build();

        // 4. For COD, payment is auto-confirmed at delivery (stays PENDING for now)
        Payment saved = paymentRepository.save(payment);

        return mapToResponse(saved);
    }

    @Override
    public PaymentResponse verifyPayment(PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByPaymentId(request.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Payment not found with id: " + request.getPaymentId()));

        // Only ONLINE_PAYMENT can be verified
        if (payment.getPaymentMethod() != PaymentMethod.ONLINE_PAYMENT) {
            throw new InvalidPaymentException(
                    "Only online payments can be verified. This is a " +
                    payment.getPaymentMethod().name() + " payment.");
        }

        // Cannot verify an already processed payment
        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new InvalidPaymentException(
                    "Payment has already been processed with status: " +
                    payment.getPaymentStatus().name());
        }

        if (request.isSuccess()) {
            // Successful payment
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setTransactionId(request.getTransactionId());
            payment.setPaidAt(LocalDateTime.now());

            // Sync order payment status
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(order);
        } else {
            // Failed payment
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setTransactionId(request.getTransactionId());

            // Sync order payment status
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
        }

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByPaymentId(String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Payment not found with id: " + paymentId));
        return mapToResponse(payment);
    }

    // ---- Internal helpers ----

    /**
     * Generate a unique payment ID like: PAY-20260527-A3F8B1.
     */
    private String generatePaymentId() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniquePart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "PAY-" + datePart + "-" + uniquePart;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentId(payment.getPaymentId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .paymentMethod(payment.getPaymentMethod().name())
                .paymentStatus(payment.getPaymentStatus().name())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
