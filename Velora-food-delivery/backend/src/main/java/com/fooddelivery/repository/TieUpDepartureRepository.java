package com.fooddelivery.repository;

import com.fooddelivery.entity.TieUpDeparture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface TieUpDepartureRepository extends JpaRepository<TieUpDeparture, Long> {
    List<TieUpDeparture> findByCompanyNameInOrderByLeftAtDesc(Collection<String> companyNames);

    void deleteByCustomerEmailIgnoreCaseAndCompanyNameIgnoreCase(String customerEmail, String companyName);
}
