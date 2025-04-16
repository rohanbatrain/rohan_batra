import 'package:flutter/material.dart';

class ArchManjaroDualBoot extends StatelessWidget {
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
        title: Text('Arch-Linux + Manjaro – Production Setup'),
      ),
      body: Column(
        children: [
          Image.asset(
            isDarkMode
                ? 'assets/images/banners/Arch-Linux-and-Manjaro/1.png'
                : 'assets/images/banners/Arch-Linux-and-Manjaro/2.png',
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
                      'Arch-Linux + Manjaro – Production Setup',
                      style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Overview:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'This setup became my production environment where I balanced a minimalistic approach with the need for practical conveniences. I embraced Arch-Linux to deeply understand the system, while dual booting with Manjaro ensured I had access to tools like KDE Connect and other user-friendly features.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'Experience & Implementation:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Minimalist Learning Environment:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Arch-Linux provided a pure, barebones system that allowed me to learn Linux internals, play around with system configurations, and truly understand the core workings of Linux.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Practical Dual Boot Strategy:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  Recognizing the need for daily conveniences, I dual booted Arch-Linux with Manjaro. This approach gave me the best of both worlds: the depth of Arch for learning and the streamlined experience of Manjaro for productivity.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 8.0),
                    Text(
                      '• Setup Documentation:',
                      style: TextStyle(fontSize: 14.0, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '  I documented the process with detailed scripts, showcasing a reproducible method for installing and configuring a dual boot system between Arch and Manjaro.',
                      style: TextStyle(fontSize: 14.0),
                    ),
                    SizedBox(height: 12.0),
                    Text(
                      'References:',
                      style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4.0),
                    Text(
                      'For a detailed walkthrough and the installation scripts, please refer to the provided scripts repository.',
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
