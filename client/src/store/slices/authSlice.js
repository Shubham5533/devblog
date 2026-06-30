import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed')
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout')
})

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch {
    return rejectWithValue(null)
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Update failed')
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/change-password', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    initializing: true,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, action) => { state.user = action.payload },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })

    // Login
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null; state.token = null
      localStorage.removeItem('token')
    })

    // Fetch me
    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.initializing = true })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user; state.initializing = false
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null; state.initializing = false
        localStorage.removeItem('token')
      })

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
