import { api } from './client'

export const categoriesApi = {
  list: () => api.get('/categories.php', { action: 'list' }),
  create: (data) => api.post('/categories.php?action=create', data),
  update: (id, data) => api.put('/categories.php?action=update', { id, ...data }),
  remove: (id) => api.del('/categories.php?action=delete', { id }),
}
