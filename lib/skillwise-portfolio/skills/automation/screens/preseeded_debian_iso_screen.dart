import 'package:flutter/material.dart';
import 'package:rohanbatra/professional-experience/secret_startup_page.dart';
import '../widgets/related_to_section.dart'; // Updated import for RelatedToSection

class PreseededDebianISOScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Preseeded Debian ISO'),
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
                          ? 'assets/images/banners/Debian-Linux/2.png'
                          : 'assets/images/banners/Debian-Linux/1.png',
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
                          'Details about Preseeded Debian ISO',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'This project involved creating a preseed file that contained predefined users and passwords. '
                          'The preseed file was integrated into a Debian ISO image, enabling automated installations. '
                          'During the installation process, the preseed option was selected in GRUB, and keystrokes were sent using the Proxmox API to initiate the installation seamlessly. '
                          'After the installation was complete, additional configuration tasks were automated using Ansible, which logged in using the root account to perform these tasks efficiently.',
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

          // Related To Section (Footer)
          RelatedToSection(
            description: 'This project was undertaken to streamline the bulk installation of Debian operating systems for my secret startup. '
                'The goal was to automate the installation process, significantly reducing the time and effort required for manual installations.',
            screen: SecretStartupPage(), // Pass the target screen
          ),
        ],
      ),
    );
  }
}
