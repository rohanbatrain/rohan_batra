import 'package:flutter/material.dart';

class MondayScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Monday.com')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Monday/2.png'
                    : 'assets/images/banners/Monday/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),
            const Center(child: Text('Monday.com – Highly customizable work management platform')),
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
                'Monday.com is a highly customizable work management platform that adapts to a wide range of workflows. It provides flexibility for teams to design their own processes, automate tasks, and visualize project data in various formats. Its versatility makes it suitable for both simple and complex project requirements.',
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
                'We evaluated Monday.com as a potential solution, recognizing its adaptability. However, we found that it could sometimes be either too complex or too limited for our specific needs. This realization prompted us to continue our search for a platform that better matched our workflow.',
                textAlign: TextAlign.left,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
