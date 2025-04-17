import 'package:flutter/material.dart';

class OrangeFoxScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('OrangeFox'),
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
                          ? 'assets/images/banners/OrangeFox/2.png'
                          : 'assets/images/banners/OrangeFox/1.png',
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
                          'Details about OrangeFox',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'OrangeFox is a custom recovery based on TWRP, offering additional features and a more modern UI. '
                          'It is designed to provide a better user experience while retaining all the functionality of TWRP. '
                          'OrangeFox is particularly popular among OnePlus users for its stability and enhanced features.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I discovered OrangeFox while experimenting with my OnePlus device. Its improved UI and additional features made it a joy to use compared to TWRP. '
                          'The modern design and intuitive interface felt like a significant upgrade.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I used OrangeFox for tasks such as:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Flashing custom ROMs and kernels with ease.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Managing Magisk installations for rooting and module management.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Creating and restoring backups with a more user-friendly interface.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Exploring advanced features like OTA survival and theme customization.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'OrangeFox became my preferred recovery for its polished experience and reliability. '
                          'It made the process of Android customization more enjoyable and accessible.',
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
