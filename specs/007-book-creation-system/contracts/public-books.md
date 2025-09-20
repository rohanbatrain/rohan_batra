# Contracts: Public Books

- GET /api/books?language=&genre=&page=&limit=  → list published public books
- GET /api/books/:slug → book detail (published & non-private fields)
- GET /api/books/:slug/chapters → list published non-private chapters (ordered)
- GET /api/books/:slug/:chapterSlug → chapter content (published & non-private)

SEO: provide metadata fields for rendering pages.
