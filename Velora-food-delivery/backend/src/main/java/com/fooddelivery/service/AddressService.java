package com.fooddelivery.service;

import com.fooddelivery.dto.AddressRequest;
import com.fooddelivery.dto.AddressResponse;

import java.util.List;

/**
 * Service interface for delivery address operations.
 */
public interface AddressService {

    AddressResponse addAddress(AddressRequest request);

    List<AddressResponse> getMyAddresses();

    AddressResponse getAddressById(Long id);

    AddressResponse updateAddress(Long id, AddressRequest request);

    void deleteAddress(Long id);

    AddressResponse setDefaultAddress(Long id);
}
