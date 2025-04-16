import 'package:flutter/material.dart';

class ProxmoxInstallation extends StatelessWidget {
  final bool isDarkMode = WidgetsBinding.instance.window.platformBrightness == Brightness.dark;

  void _showReferencePopup(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Reference Link'),
          content: Text(
            'https://rohanbatrain.github.io/knowledge-base/Developement-Setup/Owned-Devices/Laptops/Dell/2023/June/Dell-Latitude-E6420/',
            style: TextStyle(color: Colors.blue),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Close'),
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
        title: Text('Proxmox on Dell Latitude E6420'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Proxmox/1.png'
                : 'assets/images/banners/Proxmox/2.png',
            fit: BoxFit.cover,
            width: double.infinity,
            height: 200.0,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Proxmox on Dell Latitude E6420 – June 2023',
                      style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Overview:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'After first installing Proxmox on Harshdeep\'s computer and being captivated by its potential, I decided to bring the experience home to my Dell Latitude E6420. Although running a type-1 hypervisor on a portable laptop might raise eyebrows, I embraced the challenge with some creative modifications.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Experience & Implementation:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Innovative Setup:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  I added a secondary WiFi card and installed pfSense to turn my laptop into a virtual router, effectively wiring my entire internal infrastructure virtually.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Performance Challenges:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Despite the ingenuity, the limitations of a single dual-core processor paired with a mechanical hard drive resulted in significant I/O latency—up to nearly 100% at times—making it unreliable for running additional services like Pi-hole and LXC containers.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Learning Outcome:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  While the setup was fun and showcased the versatility of Proxmox, it also highlighted the practical performance constraints of running a full virtualization stack on a portable machine.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'References:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'For detailed scripts and further information, see the scripts repository.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    GestureDetector(
                      onTap: () => _showReferencePopup(context),
                      child: Text(
                        'Click here to view the reference link',
                        style: TextStyle(
                          fontSize: 14.0,
                          color: Colors.blue,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
