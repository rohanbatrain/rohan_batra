import 'package:flutter/material.dart';

class MinecraftScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Minecraft')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/minecraft/2.png'
                  : 'assets/images/banners/minecraft/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('Minecraft – Sandbox building and adventure game.')),
        ],
      ),
    );
  }
}
