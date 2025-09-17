// Quick test - add your first portfolio project
fetch('http://localhost:3000/api/portfolio/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My First Project',
    description: 'This is my first portfolio project!',
    category: 'Web Development',
    technologies: ['JavaScript', 'HTML', 'CSS'],
    status: 'published',
  }),
})
  .then(res => res.json())
  .then(data => console.log(data));
