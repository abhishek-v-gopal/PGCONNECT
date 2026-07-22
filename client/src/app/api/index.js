import { supabase, getAuthToken } from '../../lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// ── Authenticated fetch helper ────────────────────────────────────────────────
const authFetch = async (path, options = {}) => {
  const token = await getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

const authFetchForm = async (path, formData) => {
  const token = await getAuthToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed')
    err.status = res.status
    throw err
  }
  return data
}

// ── AUTH (Supabase client-side) ───────────────────────────────────────────────
export const userRegister = async ({ email, password, first_name, last_name, role, phone, university }) => {
  // Step 1: register with Supabase Auth + create profile via backend
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, first_name, last_name, role, phone, university }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Registration failed')

  // Step 2: sign in to get session
  if (data.token) {
    await supabase.auth.setSession({ access_token: data.token, refresh_token: data.token })
  }
  return data
}

export const userLogin = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  // fetch profile from backend
  const profile = await authFetch('/api/auth/me')
  return { ...data, user: profile.user }
}

export const logout = async () => {
  await supabase.auth.signOut()
  return { success: true }
}

export const getCurrentUser = async () => {
  return authFetch('/api/auth/me')
}

export const updatePassword = async ({ new_password }) => {
  return authFetch('/api/auth/update-password', {
    method: 'PATCH',
    body: JSON.stringify({ new_password }),
  })
}

// ── PROPERTIES ────────────────────────────────────────────────────────────────
export const getAllProperties = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return fetch(`${BASE_URL}/api/properties${qs ? '?' + qs : ''}`).then((r) => r.json())
}

export const getPropertyById = async (propertyId) => {
  return fetch(`${BASE_URL}/api/properties/${propertyId}`).then((r) => r.json())
}

export const createProperty = async (formData) => {
  return authFetchForm('/api/properties', formData)
}

export const updateProperty = async (propertyId, data) => {
  return authFetch(`/api/properties/${propertyId}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export const deleteProperty = async (propertyId) => {
  return authFetch(`/api/properties/${propertyId}`, { method: 'DELETE' })
}

export const getOwnerProperties = async () => {
  return authFetch('/api/properties/owner/mine')
}

// ── USERS ─────────────────────────────────────────────────────────────────────
export const saveProperty = async (propertyId) => {
  return authFetch(`/api/users/save/${propertyId}`, { method: 'POST' })
}

export const getSavedProperties = async () => {
  return authFetch('/api/users/saved')
}

export const updateProfile = async (profileData) => {
  return authFetch('/api/users/profile', { method: 'PATCH', body: JSON.stringify(profileData) })
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
export const createBooking = async (bookingData) => {
  return authFetch('/api/bookings', { method: 'POST', body: JSON.stringify(bookingData) })
}

export const getMyBookings = async () => {
  return authFetch('/api/bookings/mine')
}

export const getOwnerBookings = async () => {
  return authFetch('/api/bookings/owner')
}

export const updateBooking = async (bookingId, updates) => {
  return authFetch(`/api/bookings/${bookingId}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

// ── INQUIRIES ─────────────────────────────────────────────────────────────────
export const createInquiry = async (inquiryData) => {
  return authFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) })
}

export const getOwnerInquiries = async () => {
  return authFetch('/api/inquiries/owner')
}

export const updateInquiryStatus = async (inquiryId, status) => {
  return authFetch(`/api/inquiries/${inquiryId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// ── REFERRAL ──────────────────────────────────────────────────────────────────
export const getReferralCode = async () => {
  return authFetch('/api/referral/my-code')
}

export const getReferralStats = async () => {
  return authFetch('/api/referral/stats')
}

export const getReferralCommissions = async (page = 1) => {
  return authFetch(`/api/referral/commissions?page=${page}`)
}

export const updateCommissionType = async (commission_type) => {
  return authFetch('/api/referral/commission-type', { method: 'PATCH', body: JSON.stringify({ commission_type }) })
}

export const requestPayout = async () => {
  return authFetch('/api/referral/request-payout', { method: 'POST' })
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
export const createPaymentOrder = async (booking_id) => {
  return authFetch('/api/payments/create-order', { method: 'POST', body: JSON.stringify({ booking_id }) })
}

export const verifyPayment = async (paymentData) => {
  return authFetch('/api/payments/verify', { method: 'POST', body: JSON.stringify(paymentData) })
}

export const getPaymentHistory = async () => {
  return authFetch('/api/payments/history')
}

export const getOwnerPayouts = async () => {
  return authFetch('/api/payments/owner-payouts')
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export const getPropertyReviews = async (propertyId, page = 1) => {
  return fetch(`${BASE_URL}/api/reviews/property/${propertyId}?page=${page}`).then((r) => r.json())
}

export const createReview = async ({ property_id, rating, comment }) => {
  return authFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ property_id, rating, comment }),
  })
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  return authFetch('/api/admin/stats')
}

export const getVerificationQueue = async (status = 'pending', page = 1) => {
  return authFetch(`/api/admin/verification-queue?status=${status}&page=${page}`)
}

export const getAdminProperties = async (sort = 'views', page = 1) => {
  return authFetch(`/api/admin/properties?sort=${sort}&page=${page}`)
}

export const verifyProperty = async (propertyId, action) => {
  return authFetch(`/api/admin/properties/${propertyId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

export const getAdminUsers = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return authFetch(`/api/admin/users${qs ? '?' + qs : ''}`)
}

export const toggleUser = async (userId) => {
  return authFetch(`/api/admin/users/${userId}/toggle`, { method: 'PATCH' })
}

export const getAdminCommissions = async (page = 1) => {
  return authFetch(`/api/admin/commissions?page=${page}`)
}

export const getAdminPayments = async (page = 1) => {
  return authFetch(`/api/admin/payments?page=${page}`)
}

export const getAdminReviews = async (status = 'pending', page = 1) => {
  return authFetch(`/api/admin/reviews?status=${status}&page=${page}`)
}

export const moderateReview = async (reviewId, action) => {
  return authFetch(`/api/admin/reviews/${reviewId}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}
