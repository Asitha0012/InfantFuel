import { apiSlice } from "./apiSlice";

export const connectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query({
      query: (params) => ({
        url: `/api/v1/connections/search?${new URLSearchParams(params)}`,
      }),
      providesTags: ["Connections"], // <-- Add this line
      }),
    sendRequest: builder.mutation({
      query: (data) => ({
        url: "/api/v1/connections/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    acceptRequest: builder.mutation({
      query: (data) => ({
        url: "/api/v1/connections/accept",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    addConnectionDirect: builder.mutation({
      query: (data) => ({
        url: "/api/v1/connections/add-direct",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    deleteRequest: builder.mutation({
      query: (data) => ({
        url: "/api/v1/connections/delete",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    deleteConnection: builder.mutation({
      query: (data) => ({
        url: "/api/v1/connections/delete-connection",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    getIncomingRequests: builder.query({
      query: () => "/api/v1/connections/incoming",
      // Optionally, you can add providesTags if you want to auto-update requests too
      // providesTags: ["IncomingRequests"],
    }),
    getConnections: builder.query({
      query: () => "/api/v1/connections",
      providesTags: ["Connections"],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useSendRequestMutation,
  useAcceptRequestMutation,
  useAddConnectionDirectMutation,
  useDeleteRequestMutation,
  useDeleteConnectionMutation,
  useGetIncomingRequestsQuery,
  useGetConnectionsQuery,
} = connectionsApi;