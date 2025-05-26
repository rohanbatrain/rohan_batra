import 'package:flutter/material.dart';

class TrelloScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Trello')),
      body: Column(
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
        ],
      ),
    );
  }
}
