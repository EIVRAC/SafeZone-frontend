import { api } from './client'

export const agenciesApi = {
  list: () => api.get('/agencies.php', { action: 'list' }),
  create: (data) => api.post('/agencies.php?action=create', data),
  update: (id, data) => api.put('/agencies.php?action=update', { id, ...data }),
  remove: (id) => api.del('/agencies.php?action=delete', { id }),
}
