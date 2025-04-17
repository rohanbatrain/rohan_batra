import 'package:flutter/material.dart';

class WebDevelopmentScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Web Development'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Web Development',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Explore the art of building modern, responsive, and scalable websites using the latest technologies like HTML, CSS, JavaScript, and frameworks like React and Angular.',
              style: TextStyle(fontSize: 18),
            ),
          ],
        ),
      ),
    );
  }
}
