import 'package:flutter/material.dart';

class AsanaScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Asana')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Asana/2.png'
                    : 'assets/images/banners/Asana/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),
            const Center(child: Text('Asana – Task assignments, timelines, and collaboration')),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Details',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Asana is a comprehensive project management platform designed to facilitate task assignments, timelines, and team collaboration. It offers a robust suite of features for tracking work, managing dependencies, and ensuring projects stay on schedule. Asana is well-suited for teams seeking a structured approach to project management.',
                textAlign: TextAlign.left,
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Personal Experience',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'After my initial experience with Trello, I transitioned to Asana in search of a more comprehensive project management suite. While Asana provided many advanced features, there were certain limitations that became apparent during real-world use, especially when collaborating closely with my co-founder at Kruxers. These challenges ultimately led us to explore other solutions.',
                textAlign: TextAlign.left,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
