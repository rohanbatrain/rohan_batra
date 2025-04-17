import 'package:flutter/material.dart';

class IftttScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('IFTTT'),
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
                          ? 'assets/images/banners/ifttt/2.png'
                          : 'assets/images/banners/ifttt/1.png',
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
                          'Details about IFTTT',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'IFTTT (If This Then That) is a simple yet powerful automation tool that connects apps, devices, and services. '
                          'It allows users to create custom workflows, called applets, to automate tasks effortlessly. '
                          'This project utilized IFTTT to integrate various services, enabling seamless automation and enhancing productivity.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'IFTTT was one of the easiest and best automation tools I used back in the day when I started having experiments with my Android device. '
                          'I initially learned IFTTT because it offered unlimited usage without any limits (if i recall correctly), which was a huge advantage. '
                          'However, they later introduced paid plans, which, while justified due to the costs of running the software, '
                          'disappointed many users, including Linus Tech Tips, who expressed frustration during a review. '
                          'Despite this, I loved the simplicity of IFTTT and its mobile app. '
                          'I was particularly amazed by its Google Assistant integration, which was a unique feature at the time. '
                          'It was one of the first tools that introduced me to the world of automation and made a lasting impression.',
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
