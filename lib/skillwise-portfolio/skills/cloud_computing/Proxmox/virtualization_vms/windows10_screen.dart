import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class Windows10Screen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Windows 10 Entertainment VM'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Windows 10 Entertainment VM on Proxmox',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'This virtual machine setup was designed for testing sketchy software, light gaming, and other Windows-based workflows in a controlled sandbox environment. It does not use GPU passthrough due to hardware limitations but aims to maximize compatibility and performance within a Proxmox virtualized setup.',
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
              '- Testing untrusted software safely\n'
              '- Light gaming (without GPU passthrough)\n'
              '- Creating a disposable environment that doesn’t affect the host',
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
              'Name: win10-entertainment\n'
              'BIOS: OVMF (UEFI)\n'
              'Machine: pc-q35-8.1\n'
              'CPU: host, flags=+aes\n'
              'Cores: 4\n'
              'Sockets: 1\n'
              'NUMA: Enabled\n'
              'Memory: 8192 MB\n'
              'Ballooning: Disabled\n\n'
              'Disks:\n'
              '- EFI Disk: 4 MB (pre-enrolled keys)\n'
              '- System Disk: 100 GB (VirtIO, writeback, discard enabled)\n\n'
              'Boot Order:\n'
              '- scsi0 (System Disk)\n'
              '- ide0 (Windows ISO)\n'
              '- ide2 (VirtIO Drivers ISO)\n'
              '- net0 (Network)\n\n'
              'ISOs:\n'
              '- Windows 10 22H2 ISO\n'
              '- VirtIO Drivers ISO\n\n'
              'PCI:\n'
              '- Host PCI device: 0000:00:1f (included for experimental setup)\n\n'
              'VGA: Standard (No passthrough)\n'
              'Agent: Enabled',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '⚙️ Post-Install Configuration',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Once Windows was installed, the first utility run was:',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              'CTT Windows Utility',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'A powerful customization and debloating script provided by Chris Titus Tech:',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            const SelectableText(
              'iwr -useb https://christitus.com/win | iex',
              style: TextStyle(fontFamily: 'monospace', fontSize: 16),
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
                        'https://rohanbatrain.github.io/knowledge-base/Archive/Developement-Setup/Owned-Devices/Laptops/MSI/2023/August/Crucial-Drive/Promox/Virtual-Machines/win10-entertainment/',
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
