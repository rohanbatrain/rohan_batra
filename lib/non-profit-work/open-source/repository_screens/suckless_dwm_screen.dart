import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SucklessDwmScreen extends StatelessWidget {
  const SucklessDwmScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('suckless-dwm'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
      // Banner
      const SizedBox(height: 20),
      Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Image.asset(
          isDarkMode
              ? 'assets/images/banners/Dwm/Dark-Mode/2.png'
              : 'assets/images/banners/Dwm/Light-Mode/1.png',
          width: double.infinity,
          height: 200,
          fit: BoxFit.cover,
        ),
      ),
      const SizedBox(height: 30),

            // Title & Intro
            const Text(
              'suckless-dwm (Dynamic Window Manager)',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Text(
              'My personal fork of the iconic dynamic window manager `dwm`, tailored with enhancements for better usability, a clean build system, and modular configuration separation for easier patching and upgrades.',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),

            // About
            const Text(
              '🧩 About',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'This fork focuses on a balance of minimalism, control, and daily comfort. All patches are well-tested, curated for stability, and grouped by version for transparency and reproducibility.',
            ),
            const SizedBox(height: 12),
            const Text('Key Goals:', style: TextStyle(fontWeight: FontWeight.bold)),
            const Text('• Preserve core suckless principles'),
            const Text('• Modular versioned folders (e.g., v6.4)'),
            const Text('• Aesthetic and UX enhancements (status bar, gaps, systray)'),
            const Text('• Clean integration of key patches'),
            const SizedBox(height: 30),

            // Features
            const Text(
              '🚀 Features',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('• Gaps between windows'),
            const Text('• Status bar transparency'),
            const Text('• Systray support'),
            const Text('• Xresources compatibility'),
            const Text('• Per-tag layout memory'),
            const Text('• Vanity gaps & flexible layout switching'),
            const Text('• Full modular build with versioning'),
            const SizedBox(height: 30),

            // Installation
            const Text(
              '🛠️ Installation',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('Dependencies:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText('make\ngcc\nlibX11\nlibXft\nlibXinerama\nfontconfig'),
            const SizedBox(height: 10),
            const Text('Clone and Build:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText(
              'git clone https://github.com/rohanbatrain/suckless-dwm.git\n'
              'cd suckless-dwm\n'
              'sudo make clean install',
            ),
            const SizedBox(height: 10),
            const Text('User Installation:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText('make clean install PREFIX=\$HOME/.local'),
            const SizedBox(height: 30),

            // Usage
            const Text(
              '🧪 Usage',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('To launch dwm, configure your `.xinitrc` or login manager.'),
            const SelectableText('exec dwm'),
            const SizedBox(height: 8),
            const Text('Basic keybindings include:', style: TextStyle(fontWeight: FontWeight.bold)),
            const Text('• MOD+Enter → Terminal'),
            const Text('• MOD+d → dmenu'),
            const Text('• MOD+j/k → Focus windows'),
            const Text('• MOD+Shift+q → Close window'),
            const Text('• MOD+Shift+c → Recompile dwm'),
            const SizedBox(height: 30),

            // Customization
            const Text(
              '🧬 Customization',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('Tweak your build by editing `config.h` and rebuilding:'),
            const Text('• Appearance: borders, gaps, fonts, bar height'),
            const Text('• Behavior: layouts, keybindings, rules'),
            const Text('• Autostart apps, Xresources integration'),
            const SizedBox(height: 8),
            const SelectableText('sudo make clean install'),
            const SizedBox(height: 30),

            // Version History
            const Text(
              '🧾 Version History',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            DataTable(
              columns: const [
                DataColumn(label: Text('Version')),
                DataColumn(label: Text('Description')),
                DataColumn(label: Text('Date')),
              ],
              rows: const [
                DataRow(cells: [
                  DataCell(Text('v6.4')),
                  DataCell(Text('Gaps, Xresources, Systray, Per-tag layout')),
                  DataCell(Text('May 3, 2023')),
                ]),
              ],
            ),
            const SizedBox(height: 30),

            // License
            const Text(
              '📜 License',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              'Licensed under the MIT License, same as the original suckless dwm.',
            ),
            const SizedBox(height: 30),

            // Credits
            const Text(
              '🤝 Credits',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('• suckless.org for the original dwm'),
            const Text('• Dwm patches & the minimalist community'),
            const SizedBox(height: 30),

            Center(
              child: Text(
                '"Tiling made personal."',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Colors.grey[600],
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
