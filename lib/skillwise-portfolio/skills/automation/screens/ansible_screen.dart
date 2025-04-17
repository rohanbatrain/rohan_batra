import 'package:flutter/material.dart';
import '../widgets/related_to_section.dart';
import '../../../../professional-experience/secret_startup_page.dart';

class AnsibleScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ansible'),
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
                          ? 'assets/images/banners/Ansible/2.png'
                          : 'assets/images/banners/Ansible/1.png',
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
                          'Details about Ansible',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Ansible is a versatile automation tool that streamlines IT operations such as configuration management, '
                          'application deployment, and orchestration. It employs a straightforward YAML-based syntax to define tasks, '
                          'making it accessible for automating repetitive processes across diverse systems. '
                          'In this project, Ansible was instrumental in automating post-installation tasks, setting up SSH keys, '
                          'configuring Docker networking, spinning up containers, and managing high-availability clusters, among other tasks. '
                          'Its flexibility and efficiency ensured consistent and reliable system configurations.',
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
          const SizedBox(height: 12),
          RelatedToSection(
            description: 'I used Ansible after the Debian preseeded ISO as a post-installation automation tool to ensure consistent system configuration. For my Startup Project',
            screen: SecretStartupPage(), // Pass the target screen
          ),
        ],
      ),
    );
  }
}
