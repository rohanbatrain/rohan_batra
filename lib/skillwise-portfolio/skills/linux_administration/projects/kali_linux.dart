import 'package:flutter/material.dart';

class KaliLinux extends StatelessWidget {
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
        title: Text('Kali Linux on Dell Latitude E6420'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Kali-Linux/1.png'
                : 'assets/images/banners/Kali-Linux/2.png',
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
                      'Kali Linux on Dell Latitude E6420 – June 2023',
                      style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Background:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'The Dell Latitude E6420, acquired as a refurbished unit around 2016–2018, served as the starting point for my Linux journey.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Kali Linux Experience:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'Influenced by the prevalent online content promoting ethical hacking, I became intrigued by Kali Linux. This fascination led me to explore the distribution, marking my initial foray into Linux-based systems.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Key Takeaways:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• The exposure to Kali Linux sparked a deeper interest in cybersecurity and ethical hacking.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '• This experience laid the foundation for further exploration of various Linux distributions and open-source tools.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'For a detailed account, refer to the full documentation:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
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
