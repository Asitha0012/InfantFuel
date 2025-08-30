import { apiSlice } from "./apiSlice";

export const nutritionFluidApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create fluid intake record
    createFluidIntake: builder.mutation({
      query: (body) => ({
        url: "/api/v1/nutrition-fluid",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NutritionFluid"],
    }),

    // Get fluid intake records
    getFluidIntakeRecords: builder.query({
      query: (params = {}) => ({
        url: "/api/v1/nutrition-fluid",
        method: "GET",
        params,
      }),
      providesTags: ["NutritionFluid"],
    }),

    // Update fluid intake record
    updateFluidIntake: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/nutrition-fluid/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["NutritionFluid"],
    }),

    // Delete fluid intake record
    deleteFluidIntake: builder.mutation({
      query: (id) => ({
        url: `/api/v1/nutrition-fluid/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NutritionFluid"],
    }),

    // Get fluid intake statistics
    getFluidIntakeStats: builder.query({
      query: (params = {}) => ({
        url: "/api/v1/nutrition-fluid/stats",
        method: "GET",
        params,
      }),
      providesTags: ["NutritionFluidStats"],
    }),
  }),
});

export const {
  useCreateFluidIntakeMutation,
  useGetFluidIntakeRecordsQuery,
  useUpdateFluidIntakeMutation,
  useDeleteFluidIntakeMutation,
  useGetFluidIntakeStatsQuery,
} = nutritionFluidApi;
