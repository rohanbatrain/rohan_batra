import 'package:flutter/material.dart';

class CachyOsInstallation extends StatelessWidget {
  final bool isDarkMode = WidgetsBinding.instance.window.platformBrightness == Brightness.dark;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Cachy-OS on a Guest Laptop – June 2023'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Cachy-OS/1.png'
                : 'assets/images/banners/Cachy-OS/2.png',
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
                      'Overview:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'I received a guest laptop running Windows 10, but as I prefer Linux for daily use, I devised a workaround without replacing the primary OS. Using a USB-to-SATA connector, I installed Cachy-OS from an SSD originally in my Dell Latitude.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Installation Process:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Non-Intrusive Setup:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Connected the SSD via USB, enabled legacy boot (which disabled secure boot automatically), and installed Cachy-OS in offline mode to avoid disturbing the guest OS.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Offline Updates & Package Management:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Updated the system using the traditional Pacman route (offline installation), then installed key packages:',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '    - Pacman-installed: Firefox, python-pip, yay, veracrypt, obs-studio.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '    - Yay-installed: vscodium-bin (with marketplace support) and gitkraken.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'System Configuration & Development Setup:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Directory Structure:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Organized the home directory with dedicated folders for Github, Builds, and Applications.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Application Configurations:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '    - Firefox: Configured for bidirectional sync using a Firefox account.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '    - VSCodium: Set up with essential extensions, including the Python extension.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Git Setup:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Secured SSH keys (setting ~/.ssh permissions to 700 and id_rsa to 600) to ensure seamless GitHub authentication, thereby streamlining my development workflow.',
                      style: TextStyle(fontSize: 14.0),
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
