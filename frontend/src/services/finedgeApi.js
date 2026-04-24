import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

// Auto-logout on 401
const baseQueryWithAuth = async (args, api, extra) => {
  const result = await baseQuery(args, api, extra)
  if (result.error?.status === 401) api.dispatch(logout())
  return result
}

export const finedgeApi = createApi({
  reducerPath: 'finedgeApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Transaction', 'Summary'],
  endpoints: (build) => ({

    // ── Auth ─────────────────────────────────────────────────────────────
    register: build.mutation({
      query: (body) => ({ url: '/users', method: 'POST', body }),
    }),
    login: build.mutation({
      query: (body) => ({ url: '/users/login', method: 'POST', body }),
    }),

    // ── Transactions ─────────────────────────────────────────────────────
    getTransactions: build.query({
      query: (params = {}) => ({ url: '/transactions', params }),
      providesTags: ['Transaction'],
    }),
    getTransaction: build.query({
      query: (id) => `/transactions/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Transaction', id }],
    }),
    addTransaction: build.mutation({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),
    updateTransaction: build.mutation({
      query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),
    deleteTransaction: build.mutation({
      query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),

    // ── Summary ──────────────────────────────────────────────────────────
    getSummary: build.query({
      query: (params = {}) => ({ url: '/summary', params }),
      providesTags: ['Summary'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetSummaryQuery,
} = finedgeApi
