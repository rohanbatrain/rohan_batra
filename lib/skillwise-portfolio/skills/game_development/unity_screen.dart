import 'package:flutter/material.dart';

class UnityScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Unity')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Unity/2.png'
                  : 'assets/images/banners/Unity/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text('Unity – Popular cross-platform game engine for 2D/3D games.')),
          const SizedBox(height: 24),
          const Divider(thickness: 1, indent: 16, endIndent: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('Unity is a popular cross-platform game engine, well-suited for both 2D and 3D games. It is known for its user-friendly interface, extensive asset store, and a large community that provides a wealth of learning resources.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('I used Unity alongside Unreal Engine during my early learning phase, as Unity offered more accessible tutorials and resources at the time. I primarily used Unity for experimenting with small-scale games and rapid prototyping. While I did not release production apps with Unity, it served as a great platform for learning and quick testing.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
