/**
 * Address Redux slice.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import addressService from '../../services/addressService';

// ---- Async Thunks ----

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await addressService.getMyAddresses();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAddress = createAsyncThunk(
  'addresses/add',
  async (data, { rejectWithValue }) => {
    try {
      return await addressService.add(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await addressService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      return await addressService.setDefault(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    addresses: [],
    selectedAddress: null,
    loading: false,
    error: null,
  },
  reducers: {
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        // Auto-select default address
        const defaultAddr = action.payload.find((a) => a.isDefault || a.default);
        if (defaultAddr) state.selectedAddress = defaultAddr;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.addresses[index] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        // Unset all, then set the new default
        state.addresses.forEach((a) => {
          a.isDefault = false;
          a.default = false;
        });
        const index = state.addresses.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.selectedAddress = action.payload;
      });
  },
});

export const { selectAddress } = addressSlice.actions;
export default addressSlice.reducer;
