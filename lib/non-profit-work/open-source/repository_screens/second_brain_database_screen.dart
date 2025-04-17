import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SecondBrainDatabaseScreen extends StatelessWidget {
  const SecondBrainDatabaseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final bannerPath = isDarkMode
        ? 'assets/images/banners/Second-Brain-Database/Dark-Mode/banner.png'
        : 'assets/images/banners/Second-Brain-Database/Light-Mode/banner.png';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Second Brain Database'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: Image.asset(
                    bannerPath,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),

            // Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Second Brain Database',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'A centralized, platform-independent approach to managing your thoughts, tasks, and knowledge — all powered by MongoDB and Flask.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧠 Key Features:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Platform-agnostic and tool-flexible design'),
                  Text('• Centralized data using MongoDB'),
                  Text('• Modular micro frontends like Emotion Capture'),
                  Text('• Fully open-source and community-driven'),
                  SizedBox(height: 24),

                  Text(
                    '🔑 Philosophy:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Centralize your data without locking yourself into one platform. Unlike plugin-dependent tools, this system gives you full control and adaptability.',
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🌍 Open to All:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Built with love for the community, this project is open for collaboration and evolution. Let’s build smarter systems for personal growth.',
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧩 Why This Project Matters:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• 🌱 Grows with your thinking style'),
                  Text('• 🔍 Enables structured self-reflection'),
                  Text('• 🛠️ Extensible with micro frontends like Emotion Tracker'),
                  Text('• 📚 Serves as your personal knowledge system'),

                  SizedBox(height: 24),

                  Text(
                    '🐳 Docker Integration:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'The Second Brain Database is containerized using Docker, ensuring a consistent and portable environment for development and deployment.',
                  ),

                  SizedBox(height: 30),
                  Center(
                    child: Text(
                      'Open Source & Community-Driven 🧡',
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
