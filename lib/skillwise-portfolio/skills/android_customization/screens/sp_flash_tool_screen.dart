import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SpFlashToolScreen extends StatelessWidget {
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
        title: const Text('SP Flash Tool'),
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
                          ? 'assets/images/banners/SP-FLASH-TOOL/2.png'
                          : 'assets/images/banners/SP-FLASH-TOOL/1.png',
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
                          'Details about SP Flash Tool',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'SP Flash Tool is a powerful utility used to flash firmware, recover bricked devices, and perform other low-level operations on MediaTek-based Android devices. '
                          'It is widely used by developers and enthusiasts to install stock firmware, custom ROMs, and recoveries, as well as to unbrick devices.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I first came across SP Flash Tool while helping a friend recover their MediaTek-based device. '
                          'The phone was stuck in a boot loop, and SP Flash Tool proved to be a lifesaver. '
                          'Although the process seemed intimidating at first, I quickly learned how to use the tool effectively.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I have used SP Flash Tool for tasks such as:',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '- Flashing stock firmware to restore devices to their original state.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Installing custom ROMs to explore new features and improve performance.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Unbricking devices stuck in boot loops or soft-bricked states.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Formatting specific partitions like cache or userdata for clean installations.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const Text(
                          '- Backing up and restoring firmware for testing and development purposes.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'SP Flash Tool has been an invaluable resource in my Android customization journey. '
                          'Its ability to recover bricked devices and perform advanced operations makes it a must-have for anyone working with MediaTek-based devices.',
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
