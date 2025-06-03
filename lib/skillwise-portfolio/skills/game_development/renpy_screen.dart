import 'package:flutter/material.dart';

class RenpyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text("Ren'Py")),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/Renpy/2.png'
                  : 'assets/images/banners/Renpy/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text("Ren'Py – Visual novel engine for creating story-based games.")),
          const SizedBox(height: 24),
          const Divider(thickness: 1, indent: 16, endIndent: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('Ren\'Py is a visual novel engine designed for creating story-driven games using Python. It is widely used for interactive fiction and visual novels, offering a simple scripting language and strong community support.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Text('Personal Experience', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text('I plan to use Ren\'Py for developing visual novel games. Its Python-based scripting and focus on story-driven experiences make it an excellent choice for anyone interested in creating interactive narratives.', textAlign: TextAlign.left),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
