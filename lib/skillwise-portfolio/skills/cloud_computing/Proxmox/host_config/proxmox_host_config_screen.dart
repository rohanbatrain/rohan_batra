import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProxmoxHostConfigScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Proxmox Host Configuration'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Proxmox Host Configuration & Management',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'This post covers my approach to configuring and managing Proxmox hosts across different environments—from a personal MSI laptop with a Micron drive to team desktops in a production environment (Vina). Both setups illustrate how careful host configuration, network management, and post-installation tweaks can help maintain a stable and scalable virtualization environment.',
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
              '- Stability & Performance: Optimize the Proxmox host for running virtual machines and containers.\n'
              '- Network Management: Ensure reliable management network configurations to support both development and production workloads.\n'
              '- Post-Installation Tweaks: Apply system optimizations and customizations that enhance host performance and ease of management.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🛠️ Hardware Environments & Configurations',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'MSI Laptop (Micron Drive) – Proxmox Host (April 2024):\n'
              '- Platform: MSI laptop with a Micron drive\n'
              '- Environment: Personal development host\n'
              '- Key Settings:\n'
              '  - Optimized storage settings for improved disk I/O performance\n'
              '  - Custom network settings for robust host connectivity\n'
              '  - A streamlined management interface for quick troubleshooting\n\n'
              'Team Desktops – Vina Production:\n'
              '- Environment: Production hosts with detailed post-installation and installation configurations\n'
              '- Key Settings:\n'
              '  - Tailored management network configuration ensuring consistent connectivity\n'
              '  - Post-installation tweaks that harden the host and enable advanced networking features\n'
              '  - Consistent integration of production-grade settings across multiple nodes',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🔧 Configuration Highlights',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Network Configuration:\n'
              '  - Configured dedicated management networks using Proxmox’s web interface\n'
              '  - Enabled bridge management features to apply real-time network changes\n'
              '  - Balanced performance and security with tailored host network settings\n\n'
              '- System Optimization:\n'
              '  - Applied hardware-specific tweaks, such as advanced disk I/O and CPU flag settings\n'
              '  - Automated post-installation scripts on production hosts for security hardening\n'
              '  - Monitored system health continuously to preemptively address issues\n\n'
              '- Management Interface Customization:\n'
              '  - Customized the host configuration screen for clarity and ease of use\n'
              '  - Integrated modules for quick network adjustments during environment migrations\n'
              '  - Ensured adherence to best practices for both personal and production Proxmox deployments',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🔗 References',
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
                        'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/MSI/2024/April/Micron-Drive/Proxmox/HOST/?h=host\n\n'
                        'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Team-Devices/Desktops/Vina/Production/July/Post-Installation/?h=\n\n'
                        'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Team-Devices/Desktops/Vina/Production/September/Installation/?h=host#management-network-configuration',
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
