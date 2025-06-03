import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class AdbScreen extends StatelessWidget {
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
        title: const Text('ADB'),
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
                          ? 'assets/images/banners/ANDROID/2.png'
                          : 'assets/images/banners/ANDROID/1.png',
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
                          'Details about ADB',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'ADB (Android Debug Bridge) is a versatile command-line tool that allows developers to communicate with Android devices. '
                          'It is widely used for debugging, installing apps, and accessing device features that are not available through the standard UI. '
                          'ADB is an essential tool for Android developers and enthusiasts alike.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I have extensively used ADB for various tasks, including:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Running scrcpy for mirroring and controlling Android devices from my computer.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Debugging Flutter applications on physical Android devices.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Managing rooted devices, such as installing custom ROMs, modifying system files, and granting elevated permissions.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Capturing logs and debugging issues using `adb logcat`.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Sideloading APKs and testing apps during development.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'ADB has been an indispensable tool in my workflow, enabling me to explore and customize Android devices beyond their default capabilities. '
                          'It has also been a key component in my development and debugging processes, making it an essential skill for any Android enthusiast.',
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
