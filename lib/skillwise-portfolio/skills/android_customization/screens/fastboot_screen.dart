import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class FastbootScreen extends StatelessWidget {
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
        title: const Text('Fastboot'),
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
                          ? 'assets/images/banners/FASTBOOT/2.png'
                          : 'assets/images/banners/FASTBOOT/1.png',
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
                          'Details about Fastboot',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Fastboot is a protocol used to communicate with Android devices in bootloader mode. '
                          'It is primarily used for flashing firmware, unlocking bootloaders, and performing other low-level operations. '
                          'Fastboot is an essential tool for Android enthusiasts and developers working on custom ROMs and device modifications.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I have used Fastboot extensively for various tasks, including:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Unlocking bootloaders to enable advanced customizations and rooting.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Flashing custom recoveries like TWRP to gain more control over the device.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Installing custom ROMs to replace the stock Android experience with a more personalized one.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Flashing factory images to restore devices to their original state.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Modifying partitions, such as flashing boot or system images for testing purposes.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Using Fastboot commands to erase or format specific partitions like cache or userdata.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Fastboot has been an invaluable tool in my Android customization journey, allowing me to experiment with different ROMs, '
                          'recoveries, and system modifications. Its versatility and low-level access make it a must-have for anyone looking to explore '
                          'the full potential of their Android device.',
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
