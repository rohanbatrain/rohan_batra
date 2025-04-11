import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ConfigsScreen extends StatelessWidget {
  const ConfigsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Configs'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖥️ Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxHeight: 200,
                  ),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/Configs/2.png'
                        : 'assets/images/banners/Configs/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // ⚙️ Configs Details
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🛠️ Config Files',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'A collection of personal configuration files used for virtualization, window managers, and VM tweaks. Useful for system setup, automation, and tweaking UX in both Linux and Windows environments.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '📦 Notable Items:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('• Proxmox setup scripts'),
                        Text('• `.xinitrc` renamed for clarity'),
                        Text('• `vms/win10/ctt-tweaks.json` for Windows 10 optimization'),
                        Text('• Light tweaks for window manager sessions'),
                      ],
                    ),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🗓️ Last Updates:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text('• Jan 12, 2024 — `.xinitrc` renamed'),
                  Text('• Jan 12, 2024 — `ctt-tweaks.json` moved to `vms/win10/`'),

                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'MIT Licensed • Open Config Archive',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
