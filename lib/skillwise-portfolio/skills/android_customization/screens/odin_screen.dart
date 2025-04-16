import 'package:flutter/material.dart';

class OdinScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Odin'),
      ),
      body: const Center(
        child: Text('Details about Odin'),
      ),
    );
  }
}
