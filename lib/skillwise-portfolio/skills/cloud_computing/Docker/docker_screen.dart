import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohan_batra/non-profit-work/open-source/repository_screens/second_brain_database_screen.dart';

class DockerScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Docker'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Add banner images with fallback icon
            Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Docker/darkmode-banner.png'
                  : 'assets/images/banners/Docker/lightmode-banner.png',
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Center(
                child: FaIcon(
                  FontAwesomeIcons.docker,
                  size: 100,
                  color: Colors.grey,
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                '📦 Docker in Action',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Docker was used to containerize the Second Brain Database project, enabling seamless deployment and scalability. This ensures a consistent environment for development and production.',
                style: TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                '🔗 Related Project',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const SecondBrainDatabaseScreen(),
                    ),
                  );
                },
                child: const Text(
                  'Explore Second Brain Database',
                  style: TextStyle(fontSize: 16, color: Colors.blue),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
