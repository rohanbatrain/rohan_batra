import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class LandingPagesScreen extends StatelessWidget {
  const LandingPagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Landing Pages'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🌐 Banner
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
                        ? 'assets/images/banners/Landing-Pages/Dark-Mode/banner.png'
                        : 'assets/images/banners/Landing-Pages/Light-Mode/banner.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 📄 Project Details
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧭 Landing Pages',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This repository contains HTML landing pages crafted for my applications. '
                    'Each landing page is responsive, lightweight, and easy to customize.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '📁 Structure:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('• `emotion-tracker/` – standalone landing page files'),
                        Text('• `index.html` – central overview page'),
                        Text('• Future folders – for other apps'),
                      ],
                    ),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧰 Usage:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Open any HTML file in a browser to view the page.'),
                  Text('• Clone and customize as needed for your own projects.'),

                  SizedBox(height: 24),
                  Text(
                    '📬 Contributions:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('Fork • Branch • Commit • Pull Request'),

                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'Personal & Educational License • Reach out for commercial use',
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
