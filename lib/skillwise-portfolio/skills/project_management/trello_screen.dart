import 'package:flutter/material.dart';

class TrelloScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trello')),
      body: const Center(child: Text('Trello – Simple Kanban-style boards (great for visual task tracking)')),
    );
  }
}
