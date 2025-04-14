import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProxmoxVMsDeploymentScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Proxmox Virtual Machines (VMs) Deployment'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Provisioning a Virtual Machine (VM) on Proxmox',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              '1. Define the Purpose:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Identify the use-case (e.g., testing sketchy software, low-spec gaming, or running production services like PFSense).',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '2. VM Creation:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Select ISO Image: Choose the proper operating system ISO (e.g., Windows 10, FreeBSD for PFSense).\n'
              '- Configure Hardware Settings:\n'
              '  - CPU: Allocate appropriate cores (e.g., 4 cores, using host CPU type with necessary flags).\n'
              '  - Memory: Assign sufficient RAM (e.g., 8192 MB for Windows, 2048 MB for PFSense).\n'
              '  - Storage: Set disk size and type (e.g., 100 GB disk for Windows, 10 GB for PFSense) with VirtIO for improved performance.\n'
              '  - BIOS & Machine Type: Choose UEFI (OVMF) and the proper machine type (e.g., pc-q35-8.1).\n'
              '  - Networking: Configure the network model as Virtio paravirtualized and assign proper bridges.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '3. Boot Order & Installation Media:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Set the boot order to prioritize the system disk and include installation media (e.g., Windows ISO and VirtIO drivers).',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '4. Post-Installation Configuration:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Run initial setup scripts (for example, using a tool like CTT Windows Utility for Windows installations).\n'
              '- Manually configure network interfaces if necessary (static IP assignments, DHCP settings).\n'
              '- Install additional drivers and perform system optimizations based on the specific OS requirements.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '5. Validation & Testing:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Verify system stability, network connectivity, and overall performance.\n'
              '- Adjust resource allocation based on performance monitoring and user feedback.',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}
