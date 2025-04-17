import 'package:flutter/material.dart';

class SeleniumScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Selenium'),
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
                          ? 'assets/images/banners/Selenium/2.png'
                          : 'assets/images/banners/Selenium/1.png',
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
                          'Details about Selenium',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Selenium is a powerful tool for automating web browsers. '
                          'It is widely used for testing web applications and automating repetitive tasks. '
                          'This project utilized Selenium to test workflows, such as form submissions and data extraction, '
                          'making it a valuable tool for ensuring the reliability of processes.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'During my college days, I used Selenium primarily for testing purposes rather than automating tasks. '
                          'I explored its capabilities by simulating workflows like assignment submissions to understand how it could be used effectively. '
                          'While I didn’t automate anything, the experience of testing with Selenium gave me insights into its potential for streamlining processes. '
                          'I even imagined creating a script that would generate my assignment PDFs using LaTeX and automatically submit them '
                          'as soon as the portal updated. Although this idea remains unimplemented, it reflects the possibilities Selenium offers.',
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
