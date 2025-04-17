import 'package:flutter/material.dart';

class SuperSuScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('SuperSU'),
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
                          ? 'assets/images/banners/supersu/2.png'
                          : 'assets/images/banners/supersu/1.png',
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
                          'Details about SuperSU',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'SuperSU was one of the most popular tools for managing root access on Android devices. '
                          'It provided a simple interface for granting or denying root permissions to apps, making it a staple for rooted devices. '
                          'SuperSU was widely used before the advent of Magisk and other modern rooting solutions.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'SuperSU was my first experience with managing root access. Back when I started experimenting with Android customization, '
                          'it was the go-to solution for rooted devices. Its simplicity and reliability made it a favorite among enthusiasts.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I used SuperSU for tasks such as:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Granting root access to apps like Titanium Backup and Greenify.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Managing root permissions to ensure security and control.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Exploring advanced features like logging and script execution.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Although SuperSU has been largely replaced by Magisk in recent years, it remains a nostalgic part of my Android journey. '
                          'It introduced me to the possibilities of rooting and paved the way for more advanced customization.',
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
