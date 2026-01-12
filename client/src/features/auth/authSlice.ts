import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthState {
    status: 'logging' | 'logged' | 'guest';
    user: User | null;
}

const initialState: AuthState = {
    status: 'logging',
    user: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ status: 'logging' | 'logged' | 'guest'; user: User | null }>) => {
            state.status = action.payload.status;
            state.user = action.payload.user;
        },
        setStatus: (state, action: PayloadAction<'logging' | 'logged' | 'guest'>) => {
            state.status = action.payload;
        },
        clearAuth: (state) => {
            state.status = 'guest';
            state.user = null;
        },
    },
});


export const { setUser, setStatus, clearAuth } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'logged';