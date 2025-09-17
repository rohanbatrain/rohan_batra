#!/bin/bash

# Example: Add a blog post using cURL
# Make sure you're authenticated with Clerk first

curl -X POST http://localhost:3000/api/blog/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Getting Started with Next.js",
    "excerpt": "A comprehensive guide to building modern web applications with Next.js",
    "content": "# Getting Started with Next.js\n\nNext.js is a powerful React framework...",
    "category": "Web Development",
    "tags": ["nextjs", "react", "javascript"],
    "status": "published",
    "featured": false
  }'