import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class TwrpScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text('TWRP'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner widget
                  SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: Image.asset(
                      isDarkMode
                          ? 'assets/images/banners/TWRP/2.png'
                          : 'assets/images/banners/TWRP/1.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Details Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Details about TWRP',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'TWRP (Team Win Recovery Project) is a custom recovery tool that allows users to perform advanced operations on their Android devices. '
                          'It is widely used for flashing custom ROMs, creating backups, and modifying system files. '
                          'TWRP’s touch-based interface and extensive feature set made it the go-to recovery for Android enthusiasts.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'TWRP was my first introduction to custom recoveries. Back in the day, almost every YouTuber started their Android customization tutorials with TWRP. '
                          'It was the standard for flashing custom ROMs and kernels, and its popularity made it easy to find guides and resources.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I used TWRP extensively for tasks such as:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Flashing custom ROMs to explore new features and improve performance.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Creating full backups of my device before experimenting with modifications.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Wiping specific partitions like cache and data for a clean installation.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Installing custom kernels to optimize battery life and performance.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'TWRP’s reliability and widespread support made it an essential tool in my Android customization journey. '
                          'It was the foundation for many of my experiments and taught me the importance of backups and careful planning.',
                          style: TextStyle(fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
