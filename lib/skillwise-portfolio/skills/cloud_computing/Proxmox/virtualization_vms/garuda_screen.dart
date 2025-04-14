import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class GarudaScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Garuda Linux VM'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Garuda Linux VM on Proxmox',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Garuda Linux has been my choice for a high-performance, modern desktop experience running inside a virtualized environment on Proxmox. This setup, built on an MSI laptop with a Crucial drive, demonstrates how to effectively leverage Proxmox for a smooth and responsive Linux desktop.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '💡 Purpose',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Deliver a powerful yet lightweight Linux desktop in a virtualized environment.\n'
              '- Optimize system performance and responsiveness using Proxmox’s virtualization capabilities.\n'
              '- Provide a controlled environment for daily productivity and testing.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🛠️ VM Configuration',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Hardware Environment:\n'
              '- Platform: Proxmox on MSI Laptop with Crucial Drive\n'
              '- VM Type: Virtual Machine\n\n'
              'Key Settings:\n'
              '- CPU & Memory: Allocated to balance performance with resource efficiency.\n'
              '- Storage: Configured with VirtIO for enhanced disk I/O performance.\n'
              '- Networking: Standard virtualized network adapters ensure reliable connectivity.\n'
              '- Optimizations: Custom tweaks applied to Garuda Linux for improved desktop responsiveness.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🔧 Post-Installation Enhancements',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'After installing Garuda Linux on Proxmox, I implemented several customizations:\n'
              '- System Optimization: Tweaked system parameters to reduce latency and improve multitasking.\n'
              '- Theming & UI Customization: Enhanced the desktop environment for a modern and user-friendly experience.\n'
              '- Monitoring: Deployed tools to continuously monitor system performance and resource usage.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🔗 Reference',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      content: const Text(
                        'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/MSI/2023/August/Crucial-Drive/Promox/Virtual-Machines/garuda/?h=garuda',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Close'),
                        ),
                      ],
                    );
                  },
                );
              },
              child: const Text(
                'Full deployment logs and configuration notes',
                style: TextStyle(fontSize: 16, color: Colors.blue),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
