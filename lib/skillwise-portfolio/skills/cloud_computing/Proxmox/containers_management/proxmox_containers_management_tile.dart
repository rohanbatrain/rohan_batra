import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'proxmox_containers_management_screen.dart';

class ProxmoxContainersManagementTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => ProxmoxContainersManagementScreen()),
          );
        },
        title: const Text(
          'Proxmox Containers Management',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Manage containers in Proxmox.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
