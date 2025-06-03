import 'package:flutter/material.dart';

class ClickUpScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('ClickUp')),
      body: SingleChildScrollView(
        child: Column(
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
                'ClickUp is an all-in-one productivity platform that integrates tasks, docs, goals, and time tracking. It is designed to centralize work management for teams of all sizes, offering a wide array of features and customization options. ClickUp balances complexity with usability, making it a strong choice for teams seeking a unified workspace.',
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
                'Ultimately, we settled on ClickUp, appreciating its comprehensive feature set. While it initially appeared complex, we found it to be intuitive and effective for managing diverse projects. As my needs evolved, I eventually shifted focus to developing my own project management solution, called Second Brain Database, which aims to integrate project management with a broader knowledge and productivity system tailored to my unique requirements and scale.',
                textAlign: TextAlign.left,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
