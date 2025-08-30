import { apiSlice } from "./apiSlice";

export const nutritionSolidApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create solid food intake record
    createSolidFoodIntake: builder.mutation({
      query: (body) => ({
        url: "/api/v1/nutrition-solid",
        method: "POST",
        body,
      }),
      invalidatesTags: ["NutritionSolid"],
    }),

    // Get solid food intake records
    getSolidFoodRecords: builder.query({
      query: (params = {}) => ({
        url: "/api/v1/nutrition-solid",
        method: "GET",
        params,
      }),
      providesTags: ["NutritionSolid"],
    }),

    // Update solid food intake record
    updateSolidFoodIntake: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/nutrition-solid/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["NutritionSolid"],
    }),

    // Delete solid food intake record
    deleteSolidFoodIntake: builder.mutation({
      query: (id) => ({
        url: `/api/v1/nutrition-solid/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NutritionSolid"],
    }),

    // Get solid food statistics
    getSolidFoodStats: builder.query({
      query: (params = {}) => ({
        url: "/api/v1/nutrition-solid/stats",
        method: "GET",
        params,
      }),
      providesTags: ["NutritionSolidStats"],
    }),
  }),
});

export const {
  useCreateSolidFoodIntakeMutation,
  useGetSolidFoodRecordsQuery,
  useUpdateSolidFoodIntakeMutation,
  useDeleteSolidFoodIntakeMutation,
  useGetSolidFoodStatsQuery,
} = nutritionSolidApi;
