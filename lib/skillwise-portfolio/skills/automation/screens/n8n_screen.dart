import 'package:flutter/material.dart';

class N8nScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('n8n'),
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
                          ? 'assets/images/banners/N8N/2.png'
                          : 'assets/images/banners/N8N/1.png',
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
                          'Details about n8n',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'n8n is a powerful workflow automation tool that allows users to connect various services and automate tasks. '
                          'This project involved setting up n8n to streamline repetitive tasks, integrate APIs, and create custom workflows. '
                          'The tool was deployed in a secure environment, ensuring data privacy and reliability for automation processes. '
                          'Currently, I am running n8n for my secret startup and actively developing it to connect my second brain database to existing APIs, '
                          'enabling seamless integration and enhanced productivity.',
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
