import 'package:flutter/material.dart';

class MtkClientScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('MTKClient LIVE BOOT'),
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
                          ? 'assets/images/banners/MTKCLIENT/2.png'
                          : 'assets/images/banners/MTKCLIENT/1.png',
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
                          'Details about MTKClient LIVE BOOT',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'MTKClient is a powerful tool used for unbricking and flashing MediaTek-based devices. '
                          'It provides advanced features for recovering devices stuck in boot loops or bricked states. '
                          'MTKClient is particularly useful for devices where traditional tools like SP Flash Tool may not work effectively.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Personal Experience',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'I first used MTKClient to unbrick my friend’s OnePlus Nord 2 5G. The device was completely bricked, and traditional tools failed to recover it. '
                          'Using MTKClient, I was able to restore the device to a working state. The process was challenging but rewarding, and it taught me the importance of having the right tools for specific devices.',
                          style: TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'MTKClient has been a valuable addition to my toolkit, especially for handling MediaTek-based devices. '
                          'Its advanced capabilities make it a must-have for anyone working with such devices.',
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
