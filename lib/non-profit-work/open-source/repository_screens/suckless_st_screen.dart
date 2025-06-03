import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SucklessStScreen extends StatelessWidget {
  const SucklessStScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('suckless-st'),
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
                        ? 'assets/images/banners/Suckless-St/Dark-Mode/1.png'
                        : 'assets/images/banners/Suckless-St/Light-Mode/2.png',
                    width: double.infinity,
                    fit: BoxFit.cover,
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
                    'suckless-st (Simple Terminal)',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'A personal fork of the suckless st (simple terminal) project, featuring version separation and custom configurations tailored to my workflow.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧩 About',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This repository is a modified version of the minimalist st terminal emulator. It builds on the original st philosophy of simplicity, speed, and suckless design by incorporating personal patches and tweaks.',
                  ),
                  SizedBox(height: 12),
                  Text('Key Goals:'),
                  Text('• Maintain the minimalist essence of st'),
                  Text('• Add selected patches for usability'),
                  Text('• Keep versions clearly separated for clarity and modular updates'),
                  SizedBox(height: 24),

                  Text(
                    '🚀 Features',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Versioning for better patch and configuration management (v0.9)'),
                  Text('• Clean separation of patches and custom configs'),
                  Text('• Maintains upstream compatibility'),
                  Text('• Lightweight and fast'),
                  SizedBox(height: 24),

                  Text(
                    '🛠️ Installation',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('Prerequisites:'),
                  Text('• make'),
                  Text('• gcc'),
                  Text('• libX11'),
                  Text('• libXft'),
                  Text('• fontconfig'),
                  SizedBox(height: 10),
                  Text('Clone and Build:'),
                  CodeBlock('git clone https://github.com/rohanbatrain/suckless-st.git'),
                  CodeBlock('cd suckless-st'),
                  CodeBlock('sudo make clean install'),
                  SizedBox(height: 8),
                  Text('To install for your user only:'),
                  CodeBlock('make clean install PREFIX=\$HOME/.local'),
                  SizedBox(height: 24),

                  Text(
                    '🧪 Usage',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('Just run:'),
                  CodeBlock('st'),
                  SizedBox(height: 8),
                  Text('To set st as your default terminal emulator:'),
                  CodeBlock('exec st'),
                  SizedBox(height: 24),

                  Text(
                    '🧬 Customization',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('This fork is versioned (e.g., v0.9) to allow modular configurations. You can:'),
                  Text('• Tweak font, color scheme, and key bindings in config.h'),
                  Text('• Apply additional suckless patches'),
                  Text('• Track upstream changes easily'),
                  SizedBox(height: 24),

                  Text(
                    '🧾 Version History',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('Version        Description                  Date'),
                  Text('v0.9           Version Separation           May 3, 2023'),
                  SizedBox(height: 24),

                  Text(
                    '📜 License',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('This project is licensed under the MIT License, same as the original suckless st.'),
                  SizedBox(height: 24),

                  Text(
                    '🤝 Credits',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• suckless.org for the original st'),
                  SizedBox(height: 30),

                  Center(
                    child: Text(
                      'MIT Licensed – minimal but mighty ⚡',
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
