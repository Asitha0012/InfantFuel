import { apiSlice } from "./apiSlice";

export const breastfeedingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get connected baby profiles (for healthcare providers)
    getConnectedBabyProfiles: builder.query({
      query: () => ({
        url: "/api/v1/breastfeeding/connected-profiles",
        method: "GET",
      }),
    }),

    // Get breastfeeding history for a baby profile
    getBreastfeedingHistory: builder.query({
      query: (babyId) => ({
        url: `/api/v1/breastfeeding/${babyId}`,
        method: "GET",
      }),
      providesTags: (result, error, babyId) => [
        { type: "BreastfeedingHistory", id: babyId },
      ],
    }),

    // Add a breastfeeding entry
    addBreastfeedingEntry: builder.mutation({
      query: ({ babyId, ...body }) => ({
        url: `/api/v1/breastfeeding/${babyId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "BreastfeedingHistory", id: babyId },
      ],
    }),

    // Update a breastfeeding entry
    updateBreastfeedingEntry: builder.mutation({
      query: ({ babyId, entryId, ...body }) => ({
        url: `/api/v1/breastfeeding/${babyId}/${entryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "BreastfeedingHistory", id: babyId },
      ],
    }),

    // Delete a breastfeeding entry
    deleteBreastfeedingEntry: builder.mutation({
      query: ({ babyId, entryId }) => ({
        url: `/api/v1/breastfeeding/${babyId}/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "BreastfeedingHistory", id: babyId },
      ],
    }),
  }),
});

export const {
  useGetConnectedBabyProfilesQuery,
  useGetBreastfeedingHistoryQuery,
  useAddBreastfeedingEntryMutation,
  useUpdateBreastfeedingEntryMutation,
  useDeleteBreastfeedingEntryMutation,
} = breastfeedingApi;
