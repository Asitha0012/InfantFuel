import { apiSlice } from "./apiSlice";

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: () => "/api/v1/events",
    }),
    getEvent: builder.query({
      query: (id) => `/api/v1/events/${id}`,
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/api/v1/events",
        method: "POST",
        body: data,
      }),
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/events/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/api/v1/events/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;