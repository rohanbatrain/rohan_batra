import 'package:flutter/material.dart';

class TrelloScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Trello')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Trello/2.png'
                    : 'assets/images/banners/Trello/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),
            const Center(child: Text('Trello – Simple Kanban-style boards (great for visual task tracking)')),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Details',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Trello is a simple yet powerful Kanban-style project management tool. It excels at visual task tracking, making it easy to organize, prioritize, and monitor progress using boards, lists, and cards. Its intuitive interface and focus on simplicity make it a popular choice for individuals and teams starting with project management.',
                textAlign: TextAlign.left,
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Personal Experience',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.blueAccent),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Trello served as my introduction to project management tools and quickly became my preferred choice when I began managing projects in 2019. Its straightforward, Kanban-style interface made it exceptionally easy to use and allowed me to focus on organizing and tracking tasks without unnecessary complexity. The clarity and simplicity of Trello enabled me to adapt to project management workflows rapidly, making it an invaluable tool during the early stages of my journey. As my needs evolved and projects grew in complexity, I explored other platforms, but Trello’s focused approach provided a strong foundation for my understanding of effective project management.',
                textAlign: TextAlign.left,
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
