package com.fooddelivery.service;

import com.fooddelivery.dto.RestaurantEmployeeRequest;
import com.fooddelivery.dto.RestaurantEmployeeResponse;
import com.fooddelivery.dto.TieUpCustomerResponse;
import com.fooddelivery.dto.TieUpDepartureResponse;
import com.fooddelivery.entity.Restaurant;
import com.fooddelivery.entity.RestaurantEmployee;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.repository.OrderRepository;
import com.fooddelivery.repository.RestaurantEmployeeRepository;
import com.fooddelivery.repository.RestaurantRepository;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.repository.TieUpDepartureRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class RestaurantEmployeeService {
    private final RestaurantRepository restaurantRepository;
    private final RestaurantEmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TieUpDepartureRepository departureRepository;

    public RestaurantEmployeeService(RestaurantRepository restaurantRepository,
                                     RestaurantEmployeeRepository employeeRepository,
                                     UserRepository userRepository,
                                     OrderRepository orderRepository,
                                     TieUpDepartureRepository departureRepository) {
        this.restaurantRepository = restaurantRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.departureRepository = departureRepository;
    }

    @Transactional(readOnly = true)
    public List<RestaurantEmployeeResponse> listForOwner(Long restaurantId) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);
        return employeeRepository.findByRestaurantIdOrderByCompanyNameAscEmployeeNameAsc(restaurantId)
                .stream().map(employee -> map(employee, restaurant)).toList();
    }

    @Transactional(readOnly = true)
    public List<TieUpCustomerResponse> listTieUpCustomersForOwner(Long restaurantId) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);
        if (restaurant.getTieUpCompanies().isEmpty()) return List.of();
        List<RestaurantEmployee> roster = employeeRepository
                .findByRestaurantIdOrderByCompanyNameAscEmployeeNameAsc(restaurantId);
        return userRepository.findByRoleAndCompanyAffiliatedTrueAndAffiliatedCompanyInOrderByFullNameAsc(
                        com.fooddelivery.entity.Role.CUSTOMER, restaurant.getTieUpCompanies())
                .stream()
                .map(customer -> {
                    String rosterEmployeeId = roster.stream()
                            .filter(employee -> employee.getCompanyName().equalsIgnoreCase(customer.getAffiliatedCompany())
                                    && employee.getEmployeeName().trim().equalsIgnoreCase(customer.getFullName().trim()))
                            .map(RestaurantEmployee::getEmployeeId)
                            .findFirst()
                            .orElse(null);
                    return TieUpCustomerResponse.builder()
                            .fullName(customer.getFullName())
                            .email(customer.getEmail())
                            .phoneNumber(customer.getPhoneNumber())
                            .affiliatedCompany(customer.getAffiliatedCompany())
                            .employeeId(rosterEmployeeId != null ? rosterEmployeeId : customer.getEmployeeId())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TieUpDepartureResponse> listTieUpDeparturesForOwner(Long restaurantId) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);
        return listDeparturesForRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public List<TieUpDepartureResponse> listTieUpDeparturesForAdmin(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + restaurantId));
        return listDeparturesForRestaurant(restaurant);
    }

    private List<TieUpDepartureResponse> listDeparturesForRestaurant(Restaurant restaurant) {
        if (restaurant.getTieUpCompanies().isEmpty()) return List.of();
        return departureRepository.findByCompanyNameInOrderByLeftAtDesc(restaurant.getTieUpCompanies())
                .stream()
                .map(departure -> TieUpDepartureResponse.builder()
                        .customerName(departure.getCustomerName())
                        .customerEmail(departure.getCustomerEmail())
                        .phoneNumber(departure.getPhoneNumber())
                        .companyName(departure.getCompanyName())
                        .employeeId(departure.getEmployeeId())
                        .leftAt(departure.getLeftAt())
                        .build())
                .toList();
    }

    public RestaurantEmployeeResponse addForOwner(Long restaurantId, RestaurantEmployeeRequest request) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);
        String company = request.getCompanyName().trim();
        boolean tiedUp = restaurant.getTieUpCompanies().stream().anyMatch(c -> c.equalsIgnoreCase(company));
        if (!tiedUp) throw new IllegalArgumentException("Add this company as a restaurant tie-up before registering its employees");
        String employeeId = request.getEmployeeId().trim();
        if (employeeRepository.existsByRestaurantIdAndCompanyNameIgnoreCaseAndEmployeeIdIgnoreCase(restaurantId, company, employeeId)) {
            throw new IllegalArgumentException("This employee ID is already registered for this company");
        }
        RestaurantEmployee employee = new RestaurantEmployee();
        employee.setRestaurant(restaurant);
        employee.setEmployeeName(request.getEmployeeName().trim());
        employee.setEmployeeId(employeeId);
        employee.setCompanyName(company);
        employee.setPhoneNumber(request.getPhoneNumber().trim());
        return map(employeeRepository.save(employee), restaurant);
    }

    public void removeForOwner(Long restaurantId, Long employeeRecordId) {
        Restaurant restaurant = getOwnedRestaurant(restaurantId);
        RestaurantEmployee employee = employeeRepository.findById(employeeRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Roster employee not found"));
        if (!employee.getRestaurant().getId().equals(restaurant.getId())) {
            throw new IllegalArgumentException("This employee is not on this restaurant's roster");
        }
        employeeRepository.delete(employee);
    }

    @Transactional(readOnly = true)
    public List<RestaurantEmployeeResponse> listForAdmin(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + restaurantId));
        return employeeRepository.findByRestaurantIdOrderByCompanyNameAscEmployeeNameAsc(restaurantId)
                .stream().map(employee -> map(employee, restaurant)).toList();
    }

    private Restaurant getOwnedRestaurant(Long restaurantId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication == null ? null : authentication.getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated owner not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + restaurantId));
        if (!restaurant.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("You do not own this restaurant");
        }
        return restaurant;
    }

    private RestaurantEmployeeResponse map(RestaurantEmployee employee, Restaurant restaurant) {
        long count = orderRepository.countByRegisteredEmployeeAndOrderStatusNot(employee, com.fooddelivery.entity.OrderStatus.CANCELLED);
        BigDecimal owed = orderRepository.sumCompanyShareByEmployee(employee, com.fooddelivery.entity.OrderStatus.CANCELLED);
        return RestaurantEmployeeResponse.builder()
                .id(employee.getId()).restaurantId(restaurant.getId()).restaurantName(restaurant.getName())
                .employeeName(employee.getEmployeeName()).employeeId(employee.getEmployeeId())
                .companyName(employee.getCompanyName()).phoneNumber(employee.getPhoneNumber())
                .orderCount(count).companyOwedAmount(owed == null ? BigDecimal.ZERO : owed).build();
    }
}
