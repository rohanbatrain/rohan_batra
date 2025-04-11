import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SecondBrainDatabaseTelegramBotScreen extends StatelessWidget {
  const SecondBrainDatabaseTelegramBotScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bannerPath = isDark
        ? 'assets/images/banners/Second-Brain-Database-Telegram-Bot/Dark-Mode/2.png'
        : 'assets/images/banners/Second-Brain-Database-Telegram-Bot/Light-Mode/1.png';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Second Brain Database Telegram Bot'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Banner using suckless style
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: Image.asset(
                    bannerPath,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Second Brain Database Telegram Bot',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'A lightweight bot for seamless note-taking and metacognitive interactions — right inside Telegram.',
                  ),
                  Divider(height: 32),
                  Text(
                    '📌 Overview',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Interact with your Second Brain through chat. Capture thoughts, add tags, reflect, and search your knowledge base — all via Telegram.',
                  ),
                  SizedBox(height: 16),
                  Text(
                    '🎯 Goals',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  BulletList(items: [
                    'Add thoughts or notes via Telegram messages',
                    'Tag and categorize your entries',
                    'Search and recall content on demand',
                    'Enable metacognition (thoughts on thoughts)',
                    'Keep all data securely stored in MongoDB',
                  ]),
                  SizedBox(height: 16),
                  Text(
                    '🧱 Architecture (Planned)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  BulletList(items: [
                    'Frontend: Telegram bot using python-telegram-bot',
                    'Backend: Flask API (from Second Brain Database project)',
                    'Database: MongoDB for centralized storage',
                  ]),
                  SizedBox(height: 16),
                  Text(
                    '📅 Current Status',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '🚧 In Planning — Architecture design and feature mapping underway. No code implemented yet.',
                  ),
                  SizedBox(height: 16),
                  Text(
                    '📂 Planned Folder Structure',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  CodeBlock(lines: [
                    'second_brain_database_telegram_bot/',
                    '├── docs/         # Documentation & plans',
                    '├── bot/          # Bot logic and handlers',
                    '├── config/       # Configs & secrets',
                    '├── tests/        # Unit & integration tests',
                    '└── README.md     # Project summary',
                  ]),
                  SizedBox(height: 16),
                  Text(
                    '🤝 Get Involved',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Planning is open! Got ideas? Contribute to discussions or suggest features.',
                  ),
                  SizedBox(height: 16),
                  Text(
                    '📬 Stay in the Loop',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Part of the wider Second Brain ecosystem. Join our Telegram test group (TBD) or watch the repo for updates.',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BulletList extends StatelessWidget {
  final List<String> items;
  const BulletList({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items
          .map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 4.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("• "),
                    Expanded(child: Text(item)),
                  ],
                ),
              ))
          .toList(),
    );
  }
}

class CodeBlock extends StatelessWidget {
  final List<String> lines;
  const CodeBlock({super.key, required this.lines});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.grey.shade900 : Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: lines.map(
          (line) => Text(
            line,
            style: TextStyle(
              fontFamily: 'monospace',
              color: isDark ? Colors.grey.shade200 : Colors.black87,
            ),
          ),
        ).toList(),
      ),
    );
  }
}
