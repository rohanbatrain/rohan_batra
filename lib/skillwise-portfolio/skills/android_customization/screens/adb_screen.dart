import 'package:flutter/material.dart';

class AdbScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ADB'),
      ),
      body: const Center(
        child: Text('Details about ADB'),
      ),
    );
  }
}
