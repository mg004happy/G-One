package com.fooddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurant_employees", uniqueConstraints = {
        @UniqueConstraint(name = "uq_restaurant_company_employee", columnNames = {"restaurant_id", "company_name", "employee_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class RestaurantEmployee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "employee_name", nullable = false, length = 160)
    private String employeeName;

    @Column(name = "employee_id", nullable = false, length = 80)
    private String employeeId;

    @Column(name = "company_name", nullable = false, length = 120)
    private String companyName;

    @Column(name = "phone_number", nullable = false, length = 40)
    private String phoneNumber;
}
