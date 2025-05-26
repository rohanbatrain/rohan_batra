import 'package:flutter/material.dart';

class ClockifyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clockify')),
      body: const Center(child: Text('Clockify – Track time, manage tasks, and boost productivity.')),
    );
  }
}
