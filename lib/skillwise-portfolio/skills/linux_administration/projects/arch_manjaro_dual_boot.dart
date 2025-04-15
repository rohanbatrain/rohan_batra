import 'package:flutter/material.dart';

class ArchManjaroDualBoot extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Arch Linux + Manjaro Dual Boot Setup'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Combining a minimal Arch setup with the convenience of Manjaro for everyday use and better integration with tools like KDE Connect.\n\nSource: Arch with Manjaro Dual Boot Scripts',
        ),
      ),
    );
  }
}
