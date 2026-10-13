import { api } from './client'

export const authApi = {
  login: (email, password) =>
    api.post('/auth.php?action=login', {
      email,
      password,
    }),

  logout: () =>
    api.post('/auth.php?action=logout', {}),

  me: () =>
    api.get('/auth.php', {
      action: 'me',
    }),

  updateProfile: (data) =>
    data instanceof FormData
      ? api.upload('/auth.php?action=update_profile', data)
      : api.post('/auth.php?action=update_profile', data),

  changePassword: (data) =>
    api.post('/auth.php?action=change_password', data),

  /*
   * ============================================================
   * FORGOT PASSWORD
   * ============================================================
   *
   * These endpoints are also used by the Flutter application.
   * DO NOT rename the action names.
   */

  forgotPassword: (email) =>
    api.post('/auth.php?action=forgot_password', {
      email,
    }),

  resetPassword: (data) =>
    api.post('/auth.php?action=reset_password', data),
}