import { apiSlice } from './apiSlice';

export const vaccinationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVaccinations: builder.query({
      query: (babyId) => `/api/v1/vaccinations/${babyId}`,
      providesTags: (result, error, babyId) => [
        { type: 'Vaccinations', id: babyId }
      ]
    }),

    addVaccination: builder.mutation({
      query: ({ babyId, data }) => ({
        url: `/api/v1/vaccinations/${babyId}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: 'Vaccinations', id: babyId }
      ]
    }),

    updateVaccination: builder.mutation({
      query: ({ babyId, id, data }) => ({
        url: `/api/v1/vaccinations/${babyId}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: 'Vaccinations', id: babyId }
      ]
    }),

    deleteVaccination: builder.mutation({
      query: ({ babyId, id }) => ({
        url: `/api/v1/vaccinations/${babyId}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { babyId }) => [
        { type: 'Vaccinations', id: babyId }
      ]
    })
  })
});

export const {
  useGetVaccinationsQuery,
  useAddVaccinationMutation,
  useUpdateVaccinationMutation,
  useDeleteVaccinationMutation
} = vaccinationsApi;
