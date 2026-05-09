import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const sendEmailOTP = createAsyncThunk('auth/sendEmailOTP', async (email, thunkAPI) => {
  try {
    const response = await api.post('/auth/send-email-otp', { email });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const verifyEmailOTP = createAsyncThunk('auth/verifyEmailOTP', async ({ email, otp }, thunkAPI) => {
  try {
    const response = await api.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const sendPhoneOTP = createAsyncThunk('auth/sendPhoneOTP', async (phone, thunkAPI) => {
  try {
    const response = await api.post('/auth/send-phone-otp', { phone });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const verifyPhoneOTP = createAsyncThunk('auth/verifyPhoneOTP', async ({ phone, otp }, thunkAPI) => {
  try {
    const response = await api.post('/auth/verify-phone-otp', { phone, otp });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const googleAuth = createAsyncThunk('auth/googleAuth', async (idToken, thunkAPI) => {
  try {
    const response = await api.post('/auth/google', { idToken });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isAuthenticated: !!token,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  emailVerified: false,
  phoneVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    resetAuthStatus: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetVerification: (state) => {
      state.emailVerified = false;
      state.phoneVerified = false;
    },
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('token', action.payload.token);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyEmailOTP.fulfilled, (state) => { state.emailVerified = true; state.isSuccess = true; })
      .addCase(verifyPhoneOTP.fulfilled, (state) => { state.phoneVerified = true; state.isSuccess = true; })
      .addCase(registerUser.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.message = action.payload.message; })
      .addMatcher((action) => action.type.endsWith('/pending'), (state) => { state.isLoading = true; })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload?.message || action.payload || 'An error occurred'; })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state, action) => { 
        state.isLoading = false; 
        if (action.payload?.token) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.token = action.payload.token;
        }
      });
  },
});

export const { logout, resetAuthStatus, setCredentials, resetVerification } = authSlice.actions;
export default authSlice.reducer;
