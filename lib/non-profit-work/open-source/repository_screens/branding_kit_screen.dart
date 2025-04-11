import 'package:flutter/material.dart';

class BrandingKitScreen extends StatelessWidget {
  const BrandingKitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Branding Kit'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼️ Banner with full width and fixed height
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  width: double.infinity,
                  height: 200,
                  child: Image.asset(
                    'assets/images/banners/branding-kit.jpg',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),

            // 📄 All text content padded from the left
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🚀 Branding Kit',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'A repo with logos, banners, mascots, and more — helping me to stay visually consistent across all my projects.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  SizedBox(height: 24),
                  Text(
                    '✨ What’s Inside:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('• Logos (Dark & Light mode)'),
                        Text('• Banners (Dark & Light mode)'),
                        Text('• Mascots and brand symbols'),
                        Text('• Color palettes (Coming Soon)'),
                        Text('• Favicons & social templates (Coming Soon)'),
                      ],
                    ),
                  ),
                  SizedBox(height: 30),
                  Text(
                    '🔗 Repository Link:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  SelectableText(
                    'https://github.com/rohanbatrain/branding-kit',
                    style: TextStyle(
                      color: Colors.blue,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      '📄 MIT Licensed • Open Source',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
