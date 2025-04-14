import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProxmoxInstallationScreen extends StatelessWidget {
  void _showReferencePopup(BuildContext context, String link) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          content: Text(link),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Proxmox Installation'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Experience with Proxmox Installation Across Hardware Setups',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'I’ve worked extensively with Proxmox VE, installing and configuring it across a range of hardware—from personal laptops and team desktops to bare-metal systems and proprietary environments. These setups weren’t always standard, which taught me a lot about adapting infrastructure to real-world constraints.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              'A big part of my experience involved making things work in non-ideal networking conditions. For instance, I used a USB router that converted my mobile hotspot into an Ethernet output—allowing Proxmox to connect to the internet when traditional networking wasn\'t available. In other cases, I manually NATed WiFi interfaces on the host system, bypassing Proxmox’s lack of native WiFi support to keep the node online. These setups helped me prototype portable servers that could run in almost any environment.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              'Additionally, I experimented with routing external (WAN) traffic through a PFSense or OPNsense VM, which then forwarded it to the rest of the internal infrastructure—simulating a mini datacenter on a laptop or desktop. This gave me a lot of hands-on experience in:',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              '- Bridging physical and virtual networks inside Proxmox\n'
              '- Building gateway VMs (PFSense/OPNsense)\n'
              '- Working with NAT and port forwarding\n'
              '- Creating portable edge devices using Proxmox',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            const Text(
              'Overall, this has given me a solid foundation not just in setting up Proxmox, but also in improvising and maintaining a functional server environment on the go.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 24),
            const Text(
              'References:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => _showReferencePopup(
                context,
                'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/MSI/2023/August/Crucial-Drive/Proxmox/',
              ),
              child: const Text(
                '1. MSI Laptop with Crucial Drive – Proxmox Installation',
                style: TextStyle(fontSize: 16, color: Colors.blue),
              ),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => _showReferencePopup(
                context,
                'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Team-Devices/Desktops/Vina/Production/July/Installation/',
              ),
              child: const Text(
                '2. Vina Desktop – Production Installation',
                style: TextStyle(fontSize: 16, color: Colors.blue),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
