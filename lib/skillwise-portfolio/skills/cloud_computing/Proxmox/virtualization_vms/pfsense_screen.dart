import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PfsenseScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('PFSense Virtualized Firewall'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'PFSense Virtualized Firewall on Proxmox',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'PFSense acts as a core component of our portable server infrastructure. It\'s used to manage routing, DHCP, and security within isolated virtual networks. This setup turns your Proxmox server into a mini datacenter with robust network controls via virtualization.',
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
              '- Create a virtualized firewall/router with WAN and LAN interfaces\n'
              '- Act as a gateway for other internal services and VMs\n'
              '- Route mobile hotspot/WAN traffic into a virtual LAN\n'
              '- Test and simulate advanced networking scenarios',
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
              'Graphics: Spice\n'
              'SCSI Controller: Virtio SCSI single\n'
              'Bus/Device: Virtio Block\n'
              'Disk: 10 GB (VirtIO)\n'
              'Cores: 1\n'
              'Socket: 1\n'
              'CPU Type: host\n'
              'Memory: 2048 MB\n'
              'Network: Virtio Paravirtualized (vmbr0 and vmbr1)\n'
              'Proxmox Firewall: Disabled',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '⚙️ Post-Installation Steps',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Added a second vmbr1 interface to act as LAN (VirtIO)\n'
              '- Installed PFSense like a typical FreeBSD system\n'
              '- Automatically fetched WAN IP via DHCP and configured LAN manually',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🌐 Interface Setup',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '| Interface | Type        | IP Allocation     | Notes                                 |\n'
              '|-----------|-------------|-------------------|----------------------------------------|\n'
              '| WAN       | vmbr0 (eth) | DHCP (static via router) | Internet-facing (uplink 1)     |\n'
              '| LAN       | vmbr1       | 11.x.x.1          | Internal VM network (uplink 2)        |',
              style: TextStyle(fontSize: 16, fontFamily: 'monospace'),
            ),
            const SizedBox(height: 8),
            const Text(
              'To detect and assign interfaces:\n'
              '1. Temporarily disconnected vmbr interfaces in Proxmox GUI\n'
              '2. Reconnected when prompted by PFSense setup for automatic detection\n'
              '3. Set LAN to static IP and enabled DHCP server on it',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🧪 Real-World Use Case',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Using mobile hotspots and janky USB-to-Ethernet converters, this VM acted as a NAT gateway for internal infrastructure. Whether running from a laptop or baremetal desktop, this setup provided isolated environments with simulated WAN and LAN behavior.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              '🔐 Configuration Notes',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '- SSH enabled for remote shell access\n'
              '- DHCP enabled on LAN (vmbr1) to hand out IPs to internal VMs automatically',
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
                        'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/MSI/2023/August/Crucial-Drive/Promox/Virtual-Machines/PFsense/?h=pfsense',
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
