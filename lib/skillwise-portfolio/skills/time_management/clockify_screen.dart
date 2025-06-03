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
          const SizedBox(height: 24),
          const Divider(thickness: 1, indent: 16, endIndent: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('Clockify is a time tracking tool designed to help users monitor their work hours, manage tasks, and improve productivity. It offers a simple interface and robust reporting features, making it suitable for both individuals and teams.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('I chose Clockify primarily because it is open-source and free. It served as my go-to tool for tracking time efficiently without any cost barriers, making it a practical choice for personal productivity.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
