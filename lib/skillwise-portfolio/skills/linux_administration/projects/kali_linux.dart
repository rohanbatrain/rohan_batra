import 'package:flutter/material.dart';

class KaliLinux extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Kali Linux'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Live boot experience used for ethical hacking exploration during your teenage years.',
        ),
      ),
    );
  }
}
