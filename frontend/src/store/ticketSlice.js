import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios.js';

export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/tickets', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tickets');
  }
});

export const fetchTicketById = createAsyncThunk('tickets/fetchTicketById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/tickets/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch ticket details');
  }
});

export const createNewTicket = createAsyncThunk('tickets/createTicket', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/tickets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create ticket');
  }
});

export const updateTicketStatus = createAsyncThunk('tickets/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await API.patch(`/tickets/${id}/status`, { status });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status');
  }
});

export const assignTicket = createAsyncThunk('tickets/assign', async ({ id, assignedToUserId }, { rejectWithValue }) => {
  try {
    const { data } = await API.patch(`/tickets/${id}/assign`, { assignedToUserId });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to assign ticket');
  }
});

export const postMessage = createAsyncThunk('tickets/postMessage', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/tickets/${id}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to post message');
  }
});

export const escalateTicket = createAsyncThunk('tickets/escalate', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/tickets/${id}/escalate`, { reason });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to escalate ticket');
  }
});

export const fetchDashboardStats = createAsyncThunk('tickets/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/tickets/stats');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
  }
});

export const triggerSlaCheck = createAsyncThunk('tickets/triggerSlaCheck', async (_, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await API.post('/tickets/sla-check');
    dispatch(fetchTickets());
    dispatch(fetchDashboardStats());
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to trigger SLA check');
  }
});

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    activeTicketDetails: null, // { ticket, messages, activities }
    stats: null,
    loading: false,
    detailLoading: false,
    statsLoading: false,
    error: null,
    filterCategory: '',
    filterPriority: '',
    filterStatus: '',
    filterSlaBreached: false,
    searchTerm: '',
  },
  reducers: {
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterSlaBreached: (state, action) => {
      state.filterSlaBreached = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearActiveTicketDetails: (state) => {
      state.activeTicketDetails = null;
    },
    addMessageToActiveTicket: (state, action) => {
      if (state.activeTicketDetails && state.activeTicketDetails.messages) {
        state.activeTicketDetails.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Ticket Details
      .addCase(fetchTicketById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.activeTicketDetails = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // Create Ticket
      .addCase(createNewTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload);
      })
      // Update Status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const index = state.tickets.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tickets[index] = action.payload;
        if (state.activeTicketDetails?.ticket?._id === action.payload._id) {
          state.activeTicketDetails.ticket = action.payload;
        }
      })
      // Assign Ticket
      .addCase(assignTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tickets[index] = action.payload;
        if (state.activeTicketDetails?.ticket?._id === action.payload._id) {
          state.activeTicketDetails.ticket = action.payload;
        }
      })
      // Escalate Ticket
      .addCase(escalateTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tickets[index] = action.payload;
        if (state.activeTicketDetails?.ticket?._id === action.payload._id) {
          state.activeTicketDetails.ticket = action.payload;
        }
      })
      // Post Message
      .addCase(postMessage.fulfilled, (state, action) => {
        if (state.activeTicketDetails) {
          state.activeTicketDetails.messages.push(action.payload);
        }
      })
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      });
  },
});

export const {
  setFilterCategory,
  setFilterPriority,
  setFilterStatus,
  setFilterSlaBreached,
  setSearchTerm,
  clearActiveTicketDetails,
  addMessageToActiveTicket,
} = ticketSlice.actions;

export default ticketSlice.reducer;
