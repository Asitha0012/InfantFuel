import { apiSlice } from "./apiSlice";
export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (limit = 5) => `/api/v1/notifications?limit=${limit}`,
      providesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/api/v1/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});
export const { useGetNotificationsQuery, useMarkAllAsReadMutation } = notificationsApi;