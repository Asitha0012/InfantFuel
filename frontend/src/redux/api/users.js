import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: ({ page, limit }) => ({
        url: `${USERS_URL}?page=${page}&limit=${limit}`,
      }),
    }),

    getParents: builder.query({
      query: () => ({
        url: `${USERS_URL}?userType=parent`,
      }),
    }),

    getProfile: builder.query({
    query: () => ({
    url: `${USERS_URL}/profile`,
    method: "GET",
   }),
  }),

    getHealthcareProviders: builder.query({
      query: () => ({
        url: `${USERS_URL}?userType=healthcareProvider`,
      }),
    }),

    uploadProfilePicture: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/upload-profile-picture`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useProfileMutation,
  useGetUsersQuery,
  useGetParentsQuery,
  useGetProfileQuery,
  useGetHealthcareProvidersQuery,
  useUploadProfilePictureMutation,
} = userApiSlice;