import { apiSlice } from "./apiSlice";

export const weightsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get connected baby profiles (for healthcare providers)
    getConnectedBabyProfiles: builder.query({
      query: () => ({
        url: "/api/v1/weights/connected-profiles",
        method: "GET",
      }),
    }),

    // Get weight history for a baby profile
    getWeightHistory: builder.query({
      query: (babyId) => ({
        url: `/api/v1/weights/${babyId}`,
        method: "GET",
      }),
      providesTags: (result, error, babyId) => [
        { type: "WeightHistory", id: babyId },
      ],
    }),

    // Add a weight entry (healthcare provider only)
    addWeightEntry: builder.mutation({
      query: ({ babyId, ...body }) => ({
        url: `/api/v1/weights/${babyId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "WeightHistory", id: babyId },
      ],
    }),

    // Update a weight entry (healthcare provider only)
    updateWeightEntry: builder.mutation({
      query: ({ babyId, entryId, ...body }) => ({
        url: `/api/v1/weights/${babyId}/${entryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "WeightHistory", id: babyId },
      ],
    }),

    // Delete a weight entry (healthcare provider only)
    deleteWeightEntry: builder.mutation({
      query: ({ babyId, entryId }) => ({
        url: `/api/v1/weights/${babyId}/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "WeightHistory", id: babyId },
      ],
    }),
  }),
});

export const {
  useGetConnectedBabyProfilesQuery,
  useGetWeightHistoryQuery,
  useAddWeightEntryMutation,
  useUpdateWeightEntryMutation,
  useDeleteWeightEntryMutation,
} = weightsApi;
