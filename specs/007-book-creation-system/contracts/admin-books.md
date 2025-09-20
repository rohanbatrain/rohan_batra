# Contracts: Admin Books API

- GET /api/admin/books?search=&status=&visibility=&page=&limit=
- POST /api/admin/books { title, subtitle?, language, status?, visibility?, synopsis?, coverImage?, seriesName?, seriesOrder?, genres?, tags?, seoTitle?, seoDescription?, translationKey? }
- GET /api/admin/books/:id
- PUT /api/admin/books/:id { ...fields }
- DELETE /api/admin/books/:id?trash=true|permanent=true
- POST /api/admin/books/bulk { action: publish|archive|set-visibility|trash|restore, ids: [] }
- GET /api/admin/books/slug/exists?slug=&excludeId=

Responses: { success, book|books, pagination?, error? }
