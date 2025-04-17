import 'package:flutter/material.dart';

class MagiskScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Magisk'),
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
                          ? 'assets/images/banners/Magisk/2.png'
                          : 'assets/images/banners/Magisk/1.png',
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
                          'Details about Magisk',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Magisk is a powerful and versatile tool for rooting Android devices. '
                          'Unlike traditional rooting methods, Magisk provides a systemless root, meaning it modifies the boot partition instead of the system partition. '
                          'This allows users to retain the ability to pass SafetyNet checks, enabling the use of apps that require a secure environment.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Magisk has been my go-to solution for rooting Android devices, especially since I have not yet managed to get KernelSU working. '
                          'Before discovering Magisk, I used KingRoot as a kid, which was a sketchy Chinese exploit. '
                          'Learning about Magisk was a game-changer, as it provided a secure and reliable way to root devices without compromising safety.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I have used Magisk for various tasks, including:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Installing Magisk modules to enhance device functionality, such as enabling advanced features or optimizing performance.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Hiding root from apps that detect it, allowing me to use banking apps and other sensitive applications.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Modifying system properties without altering the system partition, ensuring seamless OTA updates.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Running custom scripts at boot to automate tasks or apply tweaks.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Testing and experimenting with custom ROMs and kernels while maintaining root access.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Magisk has been an indispensable tool in my Android customization journey. '
                          'Its modularity, systemless approach, and active development community make it a must-have for anyone looking to explore the full potential of their Android device.',
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
