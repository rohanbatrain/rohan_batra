import 'package:flutter/material.dart';

class DebianInstallation extends StatelessWidget {
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
        title: Text('Debian Linux on Dell Latitude E6420'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Debian-Linux/1.png'
                : 'assets/images/banners/Debian-Linux/2.png',
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
                      'Debian Linux on Dell Latitude E6420 – June 2023',
                      style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Background:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'The Dell Latitude E6420, acquired as a refurbished unit between 2016 and 2018, served as a platform for exploring various Linux distributions.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Debian Linux Experience:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'After initial experimentation with Kali Linux, I installed Debian to gain a deeper understanding of Linux systems. Debian\'s stability and adherence to free software principles provided a solid foundation for learning and development.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Key Takeaways:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Debian offered a minimalist environment, allowing me to customize the system according to my needs.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '• Through this experience, I became proficient in using Debian\'s package management system and configuring system settings.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    Text(
                      '• This setup enhanced my appreciation for open-source software and its role in fostering a collaborative development community.',
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
