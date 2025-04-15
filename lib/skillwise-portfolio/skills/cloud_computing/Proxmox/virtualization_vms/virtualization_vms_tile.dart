import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'virtualization_vms_screen.dart';

class VirtualizationVMsTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => VirtualizationVMsScreen()),
          );
        },
        title: const Text(
          'Virtualization – VMs (PFSense, Garuda, Windows-10)',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Dive into VM virtualization with various OS.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
