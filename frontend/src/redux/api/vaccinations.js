import { apiSlice } from "./apiSlice";

export const vaccinationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVaccinations: builder.query({
      query: () => "/api/v1/vaccinations",
    }),
    createVaccination: builder.mutation({
      query: (data) => ({
        url: "/api/v1/vaccinations",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetVaccinationsQuery, useCreateVaccinationMutation } = vaccinationsApi;
