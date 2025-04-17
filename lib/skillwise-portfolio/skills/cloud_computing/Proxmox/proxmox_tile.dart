import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'proxmox_screen.dart';

class ProxmoxTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: const EdgeInsets.all(8),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ProxmoxScreen()),
          );
        },
        leading: Image.asset(
          isDarkMode
              ? 'assets/logos/Proxmox/darkmode-logo.png'
              : 'assets/logos/Proxmox/whitemode-logo.png',
          width: 40,
          height: 40, // Ensure this matches the size in DockerTile
          errorBuilder: (context, error, stackTrace) => FaIcon(
            FontAwesomeIcons.server,
            size: 40, // Ensure this matches the size in DockerTile
            color: Colors.grey,
          ),
        ),
        title: const Text(
          'Proxmox',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Explore virtualization with Proxmox.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
