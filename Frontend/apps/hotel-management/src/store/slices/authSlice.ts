import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { hotelAuthService } from 'shared/lib/hotelAuth'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: {
    name: string
    code: string
    isAdmin: boolean
  }
  hotelUserId: string
  hotelId: string
  status: string
  permissions: string[]
}

interface Hotel {
  hotelId: string
  name: string
  email: string
  address: string
  city: string
  state: string
  country: string
  phone: string
  status: string
}

interface AuthState {
  user: User | null
  hotel: Hotel | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  hotel: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await hotelAuthService.login(credentials.email, credentials.password)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await hotelAuthService.logout()
      return true
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed')
    }
  }
)

// Async thunk to initialize auth state from stored data
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = hotelAuthService.isAuthenticated()
      if (isAuthenticated) {
        const user = hotelAuthService.getUser()
        const hotel = hotelAuthService.getHotel()
        const token = hotelAuthService.getToken()
        const refreshToken = hotelAuthService.getRefreshToken()
        
        return {
          user,
          hotel,
          token,
          refreshToken,
          isAuthenticated: true
        }
      }
      return {
        user: null,
        hotel: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.hotel = action.payload.hotel
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.hotel = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.hotel = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.hotel = action.payload.hotel
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = action.payload.isAuthenticated
        state.error = null
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.hotel = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setLoading, updateUser } = authSlice.actions
export default authSlice.reducer