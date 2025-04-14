import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SecondBrain2022Screen extends StatelessWidget {
  const SecondBrain2022Screen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Second Brain 2022'),
        centerTitle: true,
        backgroundColor: isDarkMode ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
      ),
      backgroundColor: isDarkMode ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🧠 Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxHeight: 200,
                  ),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/Second-Brain-2022/2.png'
                        : 'assets/images/banners/Second-Brain-2022/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 📄 Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧠 Second Brain (2022)',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This project has been marked as EOL (End of Life) as of December 2022. It was part of a structured PKM (personal knowledge management) approach using Obsidian and community tools.',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  SizedBox(height: 20),
                  Text(
                    '⚠️ Note:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'No further updates or support will be provided. Users can continue using the structure, but we recommend switching to `second-brain-template` for improved automation and streamlined use.',
                    style: TextStyle(fontSize: 14),
                  ),
                  SizedBox(height: 24),
                  Text(
                    '🔗 Supported Projects:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text('• second-brain-tools'),
                  SizedBox(height: 24),
                  Text(
                    '⚙️ Obsidian Setup:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text('• Turn off inline titles'),
                  Text('• Toggle "Show frontmatter" = true'),
                  SizedBox(height: 24),
                  Text(
                    '🧩 Recommended Plugins:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(height: 12),
                  Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('• Dataview *'),
                        Text('• Templater *'),
                        Text('• Quick Add'),
                        Text('• Periodic Notes'),
                        Text('• Zotero Integration'),
                        Text('• Quick LaTeX for Obsidian'),
                        Text('• Tracker'),
                        Text('• Banners'),
                        Text('• Database Folder'),
                        Text('• cMenu'),
                        Text('• Buttons'),
                        Text('• Recent Files'),
                        Text('• Natural Language Dates'),
                        Text('• Calendar'),
                        Text('• Day Planner'),
                        Text('• Copy Button for Code Blocks'),
                      ],
                    ),
                  ),
                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'MIT Licensed • No Longer Maintained',
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
