import 'package:flutter/material.dart';

class AltosOdysseyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text("Alto's Odyssey")),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 200,
            width: double.infinity,
            child: Image.asset(
              isDarkMode
                  ? 'assets/images/banners/GAMING/2.png'
                  : 'assets/images/banners/GAMING/1.png',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          const Center(child: Text("Alto's Odyssey – Endless sandboarding adventure.")),
        ],
      ),
    );
  }
}
