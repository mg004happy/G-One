package com.fooddelivery.service;

import com.fooddelivery.dto.ReviewRequest;
import com.fooddelivery.dto.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for review operations.
 */
public interface ReviewService {

    ReviewResponse addReview(ReviewRequest request);

    Page<ReviewResponse> getReviewsByRestaurant(Long restaurantId, Pageable pageable);

    ReviewResponse updateReview(Long reviewId, ReviewRequest request);

    void deleteReview(Long reviewId);
}
