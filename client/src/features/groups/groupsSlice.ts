import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group } from './groupsApi';

export interface GroupsState {
  activeGroupId: number | null;
  // Кэш групп для быстрого доступа
  groupsCache: Record<number, Group>;
}

const initialState: GroupsState = {
  activeGroupId: null,
  groupsCache: {},
};

export const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setActiveGroup: (state, action: PayloadAction<number | null>) => {
      state.activeGroupId = action.payload;
    },
    cacheGroup: (state, action: PayloadAction<Group>) => {
      state.groupsCache[action.payload.id] = action.payload;
    },
    removeGroupFromCache: (state, action: PayloadAction<number>) => {
      delete state.groupsCache[action.payload];
    },
    clearCache: (state) => {
      state.groupsCache = {};
    },
  },
});

export const {
  setActiveGroup,
  cacheGroup,
  removeGroupFromCache,
  clearCache,
} = groupsSlice.actions;

export default groupsSlice.reducer;
