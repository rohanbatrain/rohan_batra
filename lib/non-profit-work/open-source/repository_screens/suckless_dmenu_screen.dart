import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SucklessDmenuScreen extends StatelessWidget {
  const SucklessDmenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('suckless-dmenu'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                  ? 'assets/images/banners/Dmenu/Dark-Mode/2.png'
                  : 'assets/images/banners/Dmenu/Light-Mode/1.png',
              width: double.infinity,
              height: 200,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 30),

            // Title & Intro
            const Text(
              'suckless-dmenu (Dynamic Menu)',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            const Text(
              'A personal fork of the legendary suckless dmenu — a dynamic menu for X — enhanced with modular builds, aesthetic improvements, and key usability patches.',
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
              'This repository contains a customized version of dmenu designed to align with my workflow. While preserving the core suckless principles — minimalism, speed, and clarity — this fork adds enhancements to improve daily usability without bloating the codebase.',
            ),
            const SizedBox(height: 12),
            const Text('Key Goals:', style: TextStyle(fontWeight: FontWeight.bold)),
            const Text('• Keep dmenu lightweight and minimal'),
            const Text('• Add essential patches (fuzzy matching, centering, Xresources)'),
            const Text('• Maintain upstream compatibility'),
            const Text('• Modularize versions for clean updates and experimentation'),
            const SizedBox(height: 30),

            // Features
            const Text(
              '🚀 Features',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('• Fuzzy match support'),
            const Text('• Centered layout with customizable width'),
            const Text('• Xresources theming support'),
            const Text('• Emoji & Unicode compatibility'),
            const Text('• Clean versioning (e.g., v5.2)'),
            const Text('• Minimal and fast, true to suckless design'),
            const SizedBox(height: 30),

            // Installation
            const Text(
              '🛠️ Installation',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('Prerequisites:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText('make\ngcc\nlibX11\nlibXft\nfontconfig'),
            const SizedBox(height: 10),
            const Text('Clone and Build:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText(
              'git clone https://github.com/rohanbatrain/suckless-dmenu.git\n'
              'cd suckless-dmenu\n'
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
            const SelectableText('dmenu_run'),
            const SizedBox(height: 8),
            const Text('Pipe list into dmenu:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText('ls | dmenu'),
            const SizedBox(height: 8),
            const Text('DWM Keybinding Example:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SelectableText(
              '{ MODKEY, XK_p, spawn, SHCMD("dmenu_run") },',
            ),
            const SizedBox(height: 30),

            // Customization
            const Text(
              '🧬 Customization',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('Customize in `config.h`:'),
            const Text('• Fonts and sizes'),
            const Text('• Color schemes'),
            const Text('• Menu width, alignment, position'),
            const Text('• Prompt string and layout'),
            const Text('• Matching style (fuzzy, exact, etc.)'),
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
                  DataCell(Text('v5.2')),
                  DataCell(Text('Fuzzy match + center layout')),
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
              'Licensed under the MIT License, same as the original suckless dmenu.',
            ),
            const SizedBox(height: 30),

            // Credits
            const Text(
              '🤝 Credits',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('• suckless.org for the original dmenu'),
            const Text('• Community patch maintainers for their minimalist brilliance'),
            const SizedBox(height: 30),

            Center(
              child: Text(
                '"Simple. Fast. Yours."',
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
