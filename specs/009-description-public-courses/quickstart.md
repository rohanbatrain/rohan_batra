# Quickstart: Public Courses pages

Date: 2025-10-01

## Goal
Validate the public courses index and detail experiences render correctly with search, filters, pagination, outline, SEO, and accessibility basics.

## Prerequisites
- At least one course in the database marked published + public
- Course has at least one module and lesson

## Steps
1) Navigate to /courses
- Expect a grid of published + public courses
- Adjust search, difficulty, and tag filters and confirm results + URL query update
- Paginate if >24 results and verify pages switch
- Verify empty state shows when filters exclude all results

2) Navigate to /courses/[slug]
- Expect title, subtitle, hero (or placeholder), stats, and summary
- Scroll to outline; verify modules and lessons appear in order
- Previewable blog lessons show a visible badge and link to the blog post
- Non-blog previewable lessons show informational message when clicked

3) SEO & Sitemap (manual)
- View page head; confirm title/description present
- Ensure published, public course slugs appear in the sitemap
 - Confirm Course JSON-LD is rendered on detail pages (script[type="application/ld+json"]) and index metadata uses site helper

4) Accessibility spot-check
- Keyboard navigate filters and cards
- Check visible focus states and adequate contrast
- Ensure all images contain alt text
