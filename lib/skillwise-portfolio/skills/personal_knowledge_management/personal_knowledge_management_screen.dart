import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'obsidian_md_screen.dart';

class PersonalKnowledgeManagementScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Personal Knowledge Management'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Personal Knowledge Management',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Centralize, organize, and connect your notes, ideas, and research for lifelong learning and productivity.',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
              child: ListTile(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ObsidianMdScreen()),
                  );
                },
                leading: CircleAvatar(
                  backgroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.grey[800] : Colors.white,
                  child: Icon(
                    FontAwesomeIcons.book,
                    color: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.deepPurple,
                  ),
                ),
                title: const Text('Obsidian MD', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Personal knowledge management and note-taking.'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
