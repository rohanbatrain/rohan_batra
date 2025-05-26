import 'package:flutter/material.dart';

class UnrealEngineScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Unreal Engine')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/UnrealEngine/2.png'
                  : 'assets/images/banners/UnrealEngine/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('Unreal Engine – AAA-quality game engine with Blueprint scripting.')),
        ],
      ),
    );
  }
}
