import 'package:flutter/material.dart';
import 'proxmox_vms_deployment_screen.dart';

class ProxmoxVMsDeploymentTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => ProxmoxVMsDeploymentScreen()),
          );
        },
        title: const Text(
          'Proxmox Virtual Machines (VMs) Deployment',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Deploy virtual machines on Proxmox.'),
        trailing: const Icon(Icons.arrow_forward),
      ),
    );
  }
}
