package com.fooddelivery.service;

import com.fooddelivery.dto.AddressRequest;
import com.fooddelivery.dto.AddressResponse;
import com.fooddelivery.entity.Address;
import com.fooddelivery.entity.User;
import com.fooddelivery.exception.AddressNotFoundException;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedOperationException;
import com.fooddelivery.repository.AddressRepository;
import com.fooddelivery.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of {@link AddressService}.
 *
 * <h3>Default-address logic:</h3>
 * <ul>
 *   <li>Only one address per user can be the default.</li>
 *   <li>When a new address is marked as default, all other addresses for that user
 *       have their {@code isDefault} flag cleared via a bulk UPDATE.</li>
 *   <li>If the user's first address is added, it is automatically set as default.</li>
 * </ul>
 */
@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(AddressRepository addressRepository,
                              UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AddressResponse addAddress(AddressRequest request) {
        User user = getAuthenticatedUser();

        // If this is the user's first address, make it default automatically
        List<Address> existing = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
        boolean shouldBeDefault = existing.isEmpty() || request.isDefault();

        if (shouldBeDefault) {
            addressRepository.clearDefaultForUser(user);
        }

        Address address = Address.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .landmark(request.getLandmark())
                .addressType(request.getAddressType())
                .isDefault(shouldBeDefault)
                .user(user)
                .build();

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses() {
        User user = getAuthenticatedUser();
        return addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long id) {
        Address address = findAndVerifyOwnership(id);
        return mapToResponse(address);
    }

    @Override
    public AddressResponse updateAddress(Long id, AddressRequest request) {
        Address address = findAndVerifyOwnership(id);

        // Handle default flag change
        if (request.isDefault() && !address.isDefault()) {
            addressRepository.clearDefaultForUser(address.getUser());
        }

        address.setFullName(request.getFullName());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        address.setAddressType(request.getAddressType());
        address.setDefault(request.isDefault());

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Override
    public void deleteAddress(Long id) {
        Address address = findAndVerifyOwnership(id);
        addressRepository.delete(address);
    }

    @Override
    public AddressResponse setDefaultAddress(Long id) {
        Address address = findAndVerifyOwnership(id);

        // Clear existing default and set new one
        addressRepository.clearDefaultForUser(address.getUser());
        address.setDefault(true);

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    // ---- Internal helpers ----

    private Address findAndVerifyOwnership(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AddressNotFoundException(
                        "Address not found with id: " + id));

        User currentUser = getAuthenticatedUser();
        if (!address.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException(
                    "You do not own this address");
        }

        return address;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .landmark(address.getLandmark())
                .addressType(address.getAddressType().name())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
