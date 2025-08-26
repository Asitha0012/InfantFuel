import { apiSlice } from "./apiSlice";

export const medicationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getmedications: builder.query({
      query: () => "/api/v1/medications",
    }),
    createmedications: builder.mutation({
      query: (data) => ({
        url: "/api/v1/medications",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetmedicationsQuery, useCreatemedicationsMutation } = medicationsApi;
