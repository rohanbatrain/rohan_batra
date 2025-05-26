import 'package:flutter/material.dart';

class ClickUpScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('ClickUp')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Clickup/2.png'
                  : 'assets/images/banners/Clickup/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('ClickUp – All-in-one platform with docs, goals, and time tracking')),
        ],
      ),
    );
  }
}
