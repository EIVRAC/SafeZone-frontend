import { api } from './client'

export const notificationsApi = {
  list: () => api.get('/notifications.php', { action: 'list' }),
  markRead: (id) => api.post('/notifications.php?action=mark_read', { id }),
  markAllRead: () => api.post('/notifications.php?action=mark_all_read'),
  remove: (id) => api.del('/notifications.php?action=delete', { id }),
  removeAll: () => api.del('/notifications.php?action=delete_all'),
}
