import { apiSlice } from "./apiSlice";

export const headCircApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectedBabyProfilesForHeadCirc: builder.query({
      query: () => ({ url: "/api/v1/head-circumference/connected-profiles", method: "GET" }),
    }),
    getHeadCircHistory: builder.query({
      query: (babyId) => ({ url: `/api/v1/head-circumference/${babyId}`, method: "GET" }),
      providesTags: (result, error, babyId) => [{ type: "HeadCircHistory", id: babyId }],
    }),
    addHeadCircEntry: builder.mutation({
      query: ({ babyId, ...body }) => ({ url: `/api/v1/head-circumference/${babyId}`, method: "POST", body }),
      invalidatesTags: (r, e, { babyId }) => [{ type: "HeadCircHistory", id: babyId }],
    }),
    updateHeadCircEntry: builder.mutation({
      query: ({ babyId, entryId, ...body }) => ({ url: `/api/v1/head-circumference/${babyId}/${entryId}`, method: "PUT", body }),
      invalidatesTags: (r, e, { babyId }) => [{ type: "HeadCircHistory", id: babyId }],
    }),
    deleteHeadCircEntry: builder.mutation({
      query: ({ babyId, entryId }) => ({ url: `/api/v1/head-circumference/${babyId}/${entryId}`, method: "DELETE" }),
      invalidatesTags: (r, e, { babyId }) => [{ type: "HeadCircHistory", id: babyId }],
    }),
  }),
});

export const {
  useGetConnectedBabyProfilesForHeadCircQuery,
  useGetHeadCircHistoryQuery,
  useAddHeadCircEntryMutation,
  useUpdateHeadCircEntryMutation,
  useDeleteHeadCircEntryMutation,
} = headCircApi;


