import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FriendsState {
  onlineFriends: number[]; // Массив ID онлайн друзей
}

const initialState: FriendsState = {
  onlineFriends: [],
};

export const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setOnlineFriends: (state, action: PayloadAction<number[]>) => {
      state.onlineFriends = action.payload;
    },
    addOnlineFriend: (state, action: PayloadAction<number>) => {
      if (!state.onlineFriends.includes(action.payload)) {
        state.onlineFriends.push(action.payload);
      }
    },
    removeOnlineFriend: (state, action: PayloadAction<number>) => {
      state.onlineFriends = state.onlineFriends.filter((id) => id !== action.payload);
    },
    clearOnlineFriends: (state) => {
      state.onlineFriends = [];
    },
  },
});

export const {
  setOnlineFriends,
  addOnlineFriend,
  removeOnlineFriend,
  clearOnlineFriends,
} = friendsSlice.actions;

export const selectIsOnlineFriend = (state: { friends: FriendsState }, friendId: number) =>
  state.friends.onlineFriends.includes(friendId);

export default friendsSlice.reducer;
