import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ScriptsScreen extends StatelessWidget {
  const ScriptsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Scripts'),
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
                        ? 'assets/images/banners/Scripts/Dark-Mode/2.png'
                        : 'assets/images/banners/Scripts/Light-Mode/1.png',
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
                    'Scripts',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'A collection of well-organized shell scripts for dev setups, configuration, and system automation.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '📁 Categories:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Database – MongoDB install for Debian'),
                  Text('• Git – Initial Git configuration'),
                  Text('• GitHub – Clone all repos, get creation dates'),
                  Text('• Package Managers – Fast mirror switching, VSCodium'),
                  Text('• Termux – SSH and full environment setup'),
                  SizedBox(height: 24),

                  Text(
                    '🚀 Getting Started:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  CodeBlock('git clone https://github.com/rohanabatrain/scripts.git'),
                  CodeBlock('cd scripts'),
                  SizedBox(height: 6),
                  Text('Browse and run scripts:'),
                  CodeBlock('cd Application-Specific/Github'),
                  CodeBlock('bash Repo-Clone.sh'),
                  SizedBox(height: 12),
                  Text(
                    '💡 Note: Some scripts require sudo or tools like jq.',
                    style: TextStyle(fontStyle: FontStyle.italic),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧠 Why This Repo Exists:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'To bootstrap dev machines, automate environments, and save setup time — especially when switching or restoring systems.',
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧩 Highlights:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• 🧪 Easily customizable'),
                  Text('• 💻 Desktop & Termux compatible'),
                  Text('• ⚡ Time-saving automations'),

                  SizedBox(height: 30),
                  Center(
                    child: Text(
                      'MIT Licensed – automate your life ✨',
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
