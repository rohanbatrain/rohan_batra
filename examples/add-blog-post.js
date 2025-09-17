// Example: How to add a blog post via API
const addBlogPost = async () => {
  const postData = {
    title: "My First Blog Post",
    excerpt: "This is a short description of my blog post that will appear in previews.",
    content: `
# Welcome to My Blog

This is the main content of my blog post. You can use **markdown** formatting here.

## Features
- Automatic slug generation
- SEO optimization
- Reading time calculation
- View counting

## Code Example
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This post demonstrates the blogging capabilities of the platform.
    `,
    featuredImage: "/images/blog/my-first-post.jpg",
    images: [
      "/images/blog/my-first-post.jpg",
      "/images/blog/my-first-post-detail.jpg"
    ],
    category: "Technology", // Required
    tags: ["javascript", "web-development", "tutorial"],
    status: "published", // Options: 'draft', 'published', 'archived'
    featured: false, // Set to true to feature on homepage
    seoTitle: "My First Blog Post - Complete Guide",
    seoDescription: "Learn how to create your first blog post with our comprehensive guide."
  };

  try {
    const response = await fetch('/api/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Blog post created:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Call the function
addBlogPost();