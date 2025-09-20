# Contracts: Admin Chapters API

- GET /api/admin/books/:bookId/chapters?status=&visibility=&page=&limit=
- POST /api/admin/books/:bookId/chapters { title, status?, visibility?, order?, storyDate?, translationKey? }
- GET /api/admin/chapters/:id
- PUT /api/admin/chapters/:id { ...fields }
- DELETE /api/admin/chapters/:id?trash=true|permanent=true
- POST /api/admin/chapters/bulk { action: publish|archive|set-visibility|trash|restore, ids: [] }
- PUT /api/admin/books/:bookId/chapters/reorder { orders: [{id, order}] }

Responses: { success, chapter|chapters, pagination?, error? }
