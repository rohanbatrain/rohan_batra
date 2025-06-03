import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SbdFlutterTemplateScreen extends StatelessWidget {
  const SbdFlutterTemplateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('SBD Flutter Template'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/SBD-Flutter-Template/Dark-Mode/2.png'
                        : 'assets/images/banners/SBD-Flutter-Template/Light-Mode/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧠 SBD Flutter Template',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'A lightweight Flutter frontend template built exclusively for the Second Brain Database (SBD).',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🚀 What’s Inside:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• 🔐 Auth-ready UI (Login, Signup)'),
                  Text('• 🧱 Modular and minimal UI'),
                  Text('• 🌙 Light/Dark mode support'),
                  Text('• ⚡️ Plug-and-play with SBD backend'),
                  SizedBox(height: 24),

                  Text(
                    '🎯 Purpose:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This is a foundation template for apps powered by Second Brain Database — not a generic starter kit.',
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🛠️ Getting Started:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  CodeBlock('git clone https://github.com/rohanbatrain/sbd_flutter_template.git'),
                  CodeBlock('cd sbd_flutter_template'),
                  SizedBox(height: 6),
                  CodeBlock('flutter pub get'),
                  CodeBlock('flutter run'),
                  SizedBox(height: 6),
                  Text('Then connect to your running SBD backend.'),
                  SizedBox(height: 24),

                  Text(
                    '🔗 Requirements:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Flutter 3.x'),
                  Text('• SBD backend'),
                  Text('• Firebase (optional)'),

                  SizedBox(height: 24),
                  Text(
                    '📌 Use Case:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Personal knowledge systems'),
                  Text('• Mindful journaling'),
                  Text('• Cognitive microtools'),
                  Text('• Metacognitive frameworks'),

                  SizedBox(height: 30),
                  Center(
                    child: Text(
                      'MIT Licensed – build your second brain frontend!',
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

// Helper widget for code blocks
class CodeBlock extends StatelessWidget {
  final String code;
  const CodeBlock(this.code, {super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 2),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF23272F) : const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? const Color(0xFF444A54) : const Color(0xFFE0E0E0),
        ),
      ),
      child: SelectableText(
        code,
        style: TextStyle(
          fontFamily: 'monospace',
          fontSize: 15,
          color: isDark ? Colors.white : Colors.black,
        ),
      ),
    );
  }
}
