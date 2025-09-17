// Create user with editor role
// This would typically be done through an admin interface

const createEditorUser = async () => {
  const userData = {
    email: 'editor@example.com',
    name: 'Blog Editor',
    role: 'editor', // or 'admin'
    avatar: '/images/avatar-default.jpg',
  };

  // This would be done through your user management system
  // For now, you can manually insert into MongoDB:

  /*
  db.users.insertOne({
    email: "editor@example.com",
    name: "Blog Editor",
    role: "editor",
    avatar: "/images/avatar-default.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  })
  */
};
