import 'package:flutter/material.dart';

class ZapierScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Zapier'),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner widget
                  SizedBox(
                    height: 200,
                    width: double.infinity,
                    child: Image.asset(
                      isDarkMode
                          ? 'assets/images/banners/Zapier/2.png'
                          : 'assets/images/banners/Zapier/1.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Details Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Details about Zapier',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Zapier is a popular automation tool that allows users to connect apps and automate workflows with minimal coding. '
                          'This project utilized Zapier to integrate various services, enabling seamless data transfer and task automation. '
                          'The tool was configured to handle repetitive tasks, improving efficiency and reducing manual effort.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Zapier was the first automation tool I learned when I started working with WordPress. '
                          'At that time, I needed a way to connect WordPress with other services using no-code or low-code solutions. '
                          'Zapier helped me bridge the gap, enabling me to automate workflows and streamline processes effectively.',
                          style: TextStyle(fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
