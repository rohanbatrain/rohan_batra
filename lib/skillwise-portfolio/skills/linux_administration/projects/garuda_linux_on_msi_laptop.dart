import 'package:flutter/material.dart';

class GarudaLinuxOnMsiLaptop extends StatelessWidget {
  final bool isDarkMode = WidgetsBinding.instance.window.platformBrightness == Brightness.dark;

  void _showReferencePopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Reference Link'),
          content: Text(
            'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/MSI/2024/January/Micron-Drive/Garuda-Linux/?h=linux',
            style: TextStyle(color: Colors.blue),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Close'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Garuda Linux on MSI Laptop'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Garuda-Linux/1.png'
                : 'assets/images/banners/Garuda-Linux/2.png',
            fit: BoxFit.cover,
            width: double.infinity,
            height: 200.0,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Garuda Linux on MSI GF63 Thin (Micron SSD) – January 2024',
                      style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Objective:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'Transitioned from Windows 11 to Garuda Linux on an MSI GF63 Thin laptop equipped with a Micron SSD, aiming for a streamlined development environment.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Key Highlights:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '- Package Management:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Utilized the pre-installed Chaotic-AUR repository, enabling direct package builds via Pacman, reducing reliance on auxiliary tools like Paru.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '- Installation Approach:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Executed a clean installation of Garuda Linux, replacing the existing Windows setup. Detailed steps and configurations were documented for reproducibility.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '- Post-Installation Configuration:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  • Directory Management: Implemented a temporary solution for copying essential directories to ensure system stability.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '  • Filesystem Setup: Configured the FSTAB file to manage disk partitions and mount points effectively.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '  • System Configuration: Customized system settings to optimize performance and align with development requirements.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Reflections:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'The migration to Garuda Linux provided a robust and efficient platform for development tasks, enhancing system responsiveness and customization capabilities.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'For a detailed walkthrough and specific configurations, refer to the full documentation:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    GestureDetector(
                      onTap: () => _showReferencePopup(context),
                      child: Text(
                        'Click here to view the reference link',
                        style: TextStyle(
                          fontSize: 14.0,
                          color: Colors.blue,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
