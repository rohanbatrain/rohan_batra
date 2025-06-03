import 'package:flutter/material.dart';

class GodotScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Godot')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Godot/2.png'
                  : 'assets/images/banners/Godot/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('Godot – Open-source, lightweight, and flexible game engine.')),
          const SizedBox(height: 24),
          const Divider(thickness: 1, indent: 16, endIndent: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('Godot is a fully open-source, lightweight, and flexible game engine that supports both 2D and 3D development. Its accessible interface and active community make it a great choice for indie developers and open-source enthusiasts.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('My experience with Godot has been exploratory, driven by my interest in open-source tools. I learned the interface and experimented with its features out of curiosity and appreciation for its open development model, making it a fun engine to explore.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
