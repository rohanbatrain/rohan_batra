import 'package:flutter/material.dart';

class GarudaLinuxOnMsiLaptop extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Garuda Linux on MSI Laptop'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Installation on your MSI laptop as detailed in your source.\n\nSource: Garuda Linux Installation Guide',
        ),
      ),
    );
  }
}
