import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProxmoxContainersManagementScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Proxmox Containers Management'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Provisioning a Container (LXC) on Proxmox',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              '1. Define the Use-Case:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Identify the lightweight service to be containerized (e.g., deploying Pi-hole for DNS-level ad blocking).',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '2. Container Creation:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Select LXC Template: Use an appropriate OS template (e.g., Ubuntu 23.04).\n'
              '- Configure Container Parameters:\n'
              '  - Hostname: Set a clear hostname (e.g., "pihole").\n'
              '  - Disk Size: Allocate minimal disk space (e.g., 4 GB).\n'
              '  - CPU & Memory: Assign minimal but sufficient resources (e.g., 1 core, 1024 MB RAM, 1024 MB swap).\n'
              '  - Networking:\n'
              '    - Configure IPv4 as static for consistent service availability.\n'
              '    - Set IPv6 to DHCP (if applicable).\n'
              '    - Define DNS domain and server details to ensure proper name resolution.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '3. Installation Steps:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Update the system packages and install essential tools (e.g., using `apt update && apt install curl`).\n'
              '- Execute the installation script (e.g., run the Pi-hole one-liner with `curl -sSL https://install.pi-hole.net | bash`).\n'
              '- Ensure the container is assigned a static IP and set to autostart for persistent operation.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '4. Post-Installation Enhancements:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Customize service settings (e.g., adding custom adlists for Pi-hole).\n'
              '- Run synchronization commands (e.g., `pihole -g` to update blocklists).\n'
              '- Validate service functionality and network connectivity.',
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
                        'https://rohanbatrain.github.io/knowledge-base/',
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
