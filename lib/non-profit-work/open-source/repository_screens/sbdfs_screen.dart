import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SbdfsScreen extends StatelessWidget {
  const SbdfsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('SBDFS'),
        centerTitle: true,
        backgroundColor: isDarkMode ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
      ),
      backgroundColor: isDarkMode ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼️ Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/SBDFS/Dark-Mode/2.png'
                        : 'assets/images/banners/SBDFS/Light-Mode/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 🧠 Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧠 SBDFS',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'A FUSE-based virtual filesystem that mounts your MongoDB notes as a navigable file system.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🚧 Status:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'This is a WIP prototype. Expect changes. Intended as a foundation for a Second Brain Database.',
                  ),
                  SizedBox(height: 24),

                  Text(
                    '🧩 Core Concepts:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Flat Filesystem: Single-level structure'),
                  Text('• Symlink-Based Hierarchy for tags/topics'),
                  Text('• MongoDB-backed: Notes = MongoDB docs'),

                  SizedBox(height: 24),
                  Text(
                    '🛠️ Features (WIP):',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• In-memory flat filesystem'),
                  Text('• MongoDB note sync'),
                  Text('• Write support'),
                  Text('• CLI symlink generator'),
                  Text('• Virtual hierarchy via bash'),
                  Text('• Metadata via xattr'),

                  SizedBox(height: 24),
                  Text(
                    '📦 Requirements:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Python 3.6+'),
                  Text('• fusepy, FUSE'),
                  Text('• MongoDB (local/remote)'),

                  SizedBox(height: 24),
                  Text(
                    '🚀 Getting Started:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  SelectableText('pip install fusepy pymongo'),
                  SizedBox(height: 6),
                  SelectableText('git clone https://github.com/rohanbatrain/sbdfs.git'),
                  SelectableText('cd sbdfs'),
                  SizedBox(height: 6),
                  SelectableText('python main.py /mnt/sbdfs'),

                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'Explore your brain via your terminal.',
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
