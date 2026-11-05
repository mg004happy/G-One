package com.fooddelivery.service;

import com.fooddelivery.dto.ReviewRequest;
import com.fooddelivery.dto.ReviewResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.Review;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.DuplicateReviewException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.ReviewNotFoundException;
import com.fooddelivery.exception.UnauthorizedOperationException;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.ReviewRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link ReviewService}.
 *
 * <h3>Business rules:</h3>
 * <ul>
 *   <li>Only customers who have ordered from a restaurant can review it.</li>
 *   <li>One review per user per restaurant (duplicate check via DB unique constraint + service check).</li>
 *   <li>After every create/update/delete, the restaurant's {@code averageRating} and
 *       {@code totalReviews} are recalculated from the reviews table.</li>
 * </ul>
 */
@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
   
    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             RestaurantRepository restaurantRepository,
                             UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ReviewResponse addReview(ReviewRequest request) {
        User user = getAuthenticatedUser();
        Restaurant restaurant = findRestaurant(request.getRestaurantId());

        // Check duplicate
        if (reviewRepository.existsByUserAndRestaurant(user, restaurant)) {
            throw new DuplicateReviewException(
                    "You have already reviewed this restaurant. Use PUT to update your review.");
        }

        Review review = Review.builder()
                .comment(request.getComment())
                .rating(request.getRating())
                .user(user)
                .restaurant(restaurant)
                .build();

        Review saved = reviewRepository.save(review);

        // Recalculate restaurant rating
        recalculateRestaurantRating(restaurant);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable) {
        Restaurant restaurant = findRestaurant(restaurantId);
        return reviewRepository.findByRestaurantOrderByCreatedAtDesc(restaurant, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(
                        "Review not found with id: " + reviewId));

        // Verify ownership
        User currentUser = getAuthenticatedUser();
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You can only update your own reviews");
        }

        review.setComment(request.getComment());
        review.setRating(request.getRating());

        Review saved = reviewRepository.save(review);

        // Recalculate restaurant rating
        recalculateRestaurantRating(review.getRestaurant());

        return mapToResponse(saved);
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(
                        "Review not found with id: " + reviewId));

        // Verify ownership
        User currentUser = getAuthenticatedUser();
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You can only delete your own reviews");
        }

        Restaurant restaurant = review.getRestaurant();
        reviewRepository.delete(review);

        // Recalculate restaurant rating
        recalculateRestaurantRating(restaurant);
    }

    // ---- Internal helpers ----

    /**
     * Recalculate and persist the restaurant's denormalized average rating and review count.
     */
    private void recalculateRestaurantRating(Restaurant restaurant) {
        double avgRating = reviewRepository.findAverageRatingByRestaurant(restaurant);
        long totalReviews = reviewRepository.countByRestaurant(restaurant);

        restaurant.setAverageRating(Math.round(avgRating * 10.0) / 10.0); // round to 1 decimal
        restaurant.setTotalReviews((int) totalReviews);
        restaurantRepository.save(restaurant);
    }

    private Restaurant findRestaurant(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + id));
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .comment(review.getComment())
                .rating(review.getRating())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .restaurantId(review.getRestaurant().getId())
                .restaurantName(review.getRestaurant().getName())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
