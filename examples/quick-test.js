// Quick test - add your first blog post
fetch('http://localhost:3000/api/blog/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My First Post',
    excerpt: 'This is my first blog post!',
    content: '# Hello World\n\nThis is my first blog post content.',
    category: 'General',
    status: 'published',
  }),
})
  .then(res => res.json())
  .then(data => console.log(data));
