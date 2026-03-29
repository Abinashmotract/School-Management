import type { AppRole } from "@/constants/school-theme";
import { loginWithCredentials } from "@/lib/auth-api";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

const SK_ACCESS = "auth_access_token";
const SK_REFRESH = "auth_refresh_token";
const SK_ROLE = "auth_role";
const SK_USER = "auth_user_json";

export type AuthUser = Record<string, unknown>;

type AuthState = {
  role: AppRole | null;
  isHydrated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  isStudentSession: boolean;
  loginError: string | null;
};

const initialState: AuthState = {
  role: null,
  isHydrated: false,
  accessToken: null,
  user: null,
  isStudentSession: false,
  loginError: null,
};

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const [storedRole, token, userJson] = await Promise.all([
    SecureStore.getItemAsync(SK_ROLE),
    SecureStore.getItemAsync(SK_ACCESS),
    SecureStore.getItemAsync(SK_USER),
  ]);
  if (storedRole === 'student' && token && userJson) {
    try {
      const user = JSON.parse(userJson) as AuthUser;
      return {
        role: 'student' as const,
        accessToken: token,
        user,
        isStudentSession: true,
      };
    } catch {
      return null;
    }
  }
  return null;
});

export const loginStudent = createAsyncThunk(
  'auth/loginStudent',
  async (
    { studentId, password }: { studentId: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await loginWithCredentials(studentId, password);
      if (!result.ok) {
        return rejectWithValue(result.message);
      }
      const roleFromApi = result.data.user?.role;
      if (String(roleFromApi).toUpperCase() !== 'STUDENT') {
        return rejectWithValue(
          'This account is not a student account. Use Student ID and the password set at admission.'
        );
      }
      await SecureStore.setItemAsync(SK_ACCESS, result.data.accessToken);
      await SecureStore.setItemAsync(SK_REFRESH, result.data.refreshToken);
      await SecureStore.setItemAsync(SK_ROLE, 'student');
      await SecureStore.setItemAsync(SK_USER, JSON.stringify(result.data.user));
      return {
        accessToken: result.data.accessToken,
        user: result.data.user,
        isStudentSession: true,
      };
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : 'Could not complete sign in.'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(SK_ACCESS).catch(() => {}),
    SecureStore.deleteItemAsync(SK_REFRESH).catch(() => {}),
    SecureStore.deleteItemAsync(SK_ROLE).catch(() => {}),
    SecureStore.deleteItemAsync(SK_USER).catch(() => {}),
  ]);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearLoginError(state) {
      state.loginError = null;
    },
    enterDemoRole(state, action: PayloadAction<AppRole>) {
      state.role = action.payload;
      state.loginError = null;
      state.isStudentSession = false;
      state.accessToken = null;
      state.user = null;
    },
    resetAuth() {
      return { ...initialState, isHydrated: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.isHydrated = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isHydrated = true;
        if (action.payload) {
          state.role = action.payload.role;
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
          state.isStudentSession = action.payload.isStudentSession;
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      .addCase(loginStudent.pending, (state) => {
        state.loginError = null;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.role = 'student';
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isStudentSession = true;
        state.loginError = null;
      })
      .addCase(loginStudent.rejected, (state, action) => {
        const msg =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Sign in failed';
        state.loginError = msg;
      })
      .addCase(logout.fulfilled, (state) => {
        state.role = null;
        state.accessToken = null;
        state.user = null;
        state.isStudentSession = false;
        state.loginError = null;
      });
  },
});

export const { clearLoginError, enterDemoRole, resetAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
