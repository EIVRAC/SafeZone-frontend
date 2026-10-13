import { api } from './client'

export const usersApi = {
  list: (role) => api.get('/users.php', { action: 'list', role }),
  create: (data) => api.post('/users.php?action=create', data),
  update: (id, data) => api.put('/users.php?action=update', { id, ...data }),
  setStatus: (id, status) => api.put('/users.php?action=status', { id, status }),
  remove: (id) => api.del('/users.php?action=delete', { id }),
}
