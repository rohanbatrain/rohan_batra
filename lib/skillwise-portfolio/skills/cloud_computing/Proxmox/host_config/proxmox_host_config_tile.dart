import 'package:flutter/material.dart';
import 'proxmox_host_config_screen.dart';

class ProxmoxHostConfigTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => ProxmoxHostConfigScreen()),
          );
        },
        title: const Text(
          'Proxmox Host Configuration',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Configure your Proxmox host effectively.'),
        trailing: const Icon(Icons.arrow_forward),
      ),
    );
  }
}
