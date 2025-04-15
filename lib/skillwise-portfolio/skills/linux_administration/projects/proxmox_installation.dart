import 'package:flutter/material.dart';

class ProxmoxInstallation extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Proxmox Installation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Deployment of a type-1 hypervisor on your Dell Latitude, paired with a secondary Wi-Fi card and pfSense to create a portable virtualized network environment.\n\nNote: Highlights challenges like I/O latency on older hardware.',
        ),
      ),
    );
  }
}
