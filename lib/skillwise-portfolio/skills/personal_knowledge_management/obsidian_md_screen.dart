import 'package:flutter/material.dart';

class ObsidianMdScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Obsidian MD')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/obsidian/2.png'
                    : 'assets/images/banners/obsidian/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),
            const Center(child: Text('Obsidian MD – Personal knowledge management and note-taking.')),
            const SizedBox(height: 24),
            const Divider(thickness: 1, indent: 16, endIndent: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('Obsidian MD is a powerful knowledge management tool that allows users to create, organize, and link notes in a flexible markdown-based system. Its graph view and plugin ecosystem make it ideal for building a personal knowledge base.', textAlign: TextAlign.left),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text('I used Obsidian MD to centralize my notes, ideas, and research. Its linking and graph features help me connect concepts and track my learning journey, making it an essential tool for my personal and professional growth.', textAlign: TextAlign.left),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
