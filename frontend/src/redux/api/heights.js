import { apiSlice } from "./apiSlice";

export const heightsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConnectedBabyProfilesForHeight: builder.query({
      query: () => ({
        url: "/api/v1/heights/connected-profiles",
        method: "GET",
      }),
    }),

    getHeightHistory: builder.query({
      query: (babyId) => ({
        url: `/api/v1/heights/${babyId}`,
        method: "GET",
      }),
      providesTags: (result, error, babyId) => [
        { type: "HeightHistory", id: babyId },
      ],
    }),

    addHeightEntry: builder.mutation({
      query: ({ babyId, ...body }) => ({
        url: `/api/v1/heights/${babyId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "HeightHistory", id: babyId },
      ],
    }),

    updateHeightEntry: builder.mutation({
      query: ({ babyId, entryId, ...body }) => ({
        url: `/api/v1/heights/${babyId}/${entryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "HeightHistory", id: babyId },
      ],
    }),

    deleteHeightEntry: builder.mutation({
      query: ({ babyId, entryId }) => ({
        url: `/api/v1/heights/${babyId}/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: "HeightHistory", id: babyId },
      ],
    }),
  }),
});

export const {
  useGetConnectedBabyProfilesForHeightQuery,
  useGetHeightHistoryQuery,
  useAddHeightEntryMutation,
  useUpdateHeightEntryMutation,
  useDeleteHeightEntryMutation,
} = heightsApi;


