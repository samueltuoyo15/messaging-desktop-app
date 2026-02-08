import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

interface ConnectionState {
  status: ConnectionStatus;
  lastHeartbeat: number | null;
  reconnectAttempts: number;
}

const initialState: ConnectionState = {
  status: 'offline',
  lastHeartbeat: null,
  reconnectAttempts: 0
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
      if (action.payload === 'connected') {
        state.reconnectAttempts = 0;
      }
    },
    setLastHeartbeat: (state, action: PayloadAction<number>) => {
      state.lastHeartbeat = action.payload;
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    }
  }
});

export const { setConnectionStatus, setLastHeartbeat, incrementReconnectAttempts, resetReconnectAttempts } = connectionSlice.actions;
export default connectionSlice.reducer;
