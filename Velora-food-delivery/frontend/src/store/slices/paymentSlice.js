/**
 * Payment Redux slice — maps to PaymentController.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// ---- Async Thunks ----

export const createPayment = createAsyncThunk(
  'payment/create',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      return await paymentService.createPayment(orderId, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (data, { rejectWithValue }) => {
    try {
      return await paymentService.verifyPayment(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPayment = createAsyncThunk(
  'payment/get',
  async (paymentId, { rejectWithValue }) => {
    try {
      return await paymentService.getPayment(paymentId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'payment/checkoutSession',
  async (orderId, { rejectWithValue }) => {
    try {
      return await paymentService.createCheckoutSession(orderId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentBySessionId = createAsyncThunk(
  'payment/getBySessionId',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await paymentService.getPaymentBySessionId(sessionId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- Slice ----

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    currentPayment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createPayment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getPayment
      .addCase(getPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createCheckoutSession
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getPaymentBySessionId
      .addCase(getPaymentBySessionId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentBySessionId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPaymentBySessionId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
