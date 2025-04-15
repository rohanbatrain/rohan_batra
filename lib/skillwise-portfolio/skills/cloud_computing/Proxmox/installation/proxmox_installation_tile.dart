import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'proxmox_installation_screen.dart';

class ProxmoxInstallationTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
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
            MaterialPageRoute(builder: (context) => ProxmoxInstallationScreen()),
          );
        },
        title: const Text(
          'Proxmox Installation',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Learn how to install Proxmox.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
