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
          const SizedBox(height: 24),
          const Divider(thickness: 1, indent: 16, endIndent: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('Unreal Engine is a leading AAA-quality game engine known for its powerful rendering, Blueprint visual scripting, and versatility across industries. It is widely used for game development, architectural visualization, and real-time 3D applications.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('I have been using Unreal Engine since version 4.19, and it has consistently been my preferred engine for any 3D work—whether it is game development, architectural visualization, or any real-time 3D project. Its robust feature set and flexibility make it my go-to choice for professional and creative projects alike.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
