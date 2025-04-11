import 'package:flutter/material.dart';

class KnowledgeBaseScreen extends StatelessWidget {
  const KnowledgeBaseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Knowledge Base'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 📘 Banner - capped height, full width
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxHeight: 200,
                  ),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/Knowledge-Base/Dark-Mode/2.png'
                        : 'assets/images/banners/Knowledge-Base/Light-Mode/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 📄 Text content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '📚 Knowledge Base',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Organize your thoughts, notes, and research in one structured place. Whether it’s learning logs, references, or your second brain — everything stays searchable and connected.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  SizedBox(height: 24),
                  Text(
                    '✨ Features:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('• Markdown-powered notes'),
                        Text('• Topic-based organization'),
                        Text('• Tags, links, and references'),
                        Text('• Beautiful UI with dark mode'),
                        Text('• Easy browsing and search'),
                      ],
                    ),
                  ),
                  SizedBox(height: 30),
                  Text(
                    '📄 Purpose:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Built as a second brain system to help with daily learning, journaling, and creative research. Your ideas deserve structure — and this is your digital home for them.',
                    style: TextStyle(fontSize: 14),
                  ),
                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'MIT Licensed • Open Source',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
