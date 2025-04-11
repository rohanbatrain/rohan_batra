import 'package:flutter/material.dart';

class EmotionTrackerScreen extends StatelessWidget {
  const EmotionTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Emotion Tracker'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼️ Banner - fit to width, max height capped
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
                        ? 'assets/images/banners/Emotion-Tracker/Dark-Mode/banner.png'
                        : 'assets/images/banners/Emotion-Tracker/Light-Mode/banner.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 📄 Text content with horizontal padding
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧠 Emotion Tracker',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Track your daily emotions and understand how your mood evolves over time. Stay mindful, reflect better, and grow emotionally.',
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
                        Text('• Log emotions throughout the day'),
                        Text('• Visualize trends and patterns'),
                        Text('• Notes for context and reflection'),
                        Text('• Light & Dark mode support'),
                        Text('• Minimal, calming UI'),
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
                    'Designed to support emotional awareness and mental well-being, especially for individuals navigating anxiety, reflection, or personal growth.',
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
