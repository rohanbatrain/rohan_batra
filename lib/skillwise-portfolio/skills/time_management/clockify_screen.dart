import 'package:flutter/material.dart';

class ClockifyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Clockify')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/clockify/2.png'
                  : 'assets/images/banners/clockify/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('Clockify – Track time, manage tasks, and boost productivity.')),
        ],
      ),
    );
  }
}
