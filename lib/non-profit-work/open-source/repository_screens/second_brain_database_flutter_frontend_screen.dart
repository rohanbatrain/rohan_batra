import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SecondBrainDatabaseFlutterFrontendScreen extends StatelessWidget {
  const SecondBrainDatabaseFlutterFrontendScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Second Brain Database'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner with updated banner logic
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/Second-Brain-Database-Flutter-Frontend/Dark-Mode/2.png'
                        : 'assets/images/banners/Second-Brain-Database-Flutter-Frontend/Light-Mode/1.png',
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Title & Intro
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🧠 Second Brain Database – Flutter Frontend',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Welcome to the Second Brain Database Flutter frontend — the official interface for interacting with your unified, personal knowledge and productivity system.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'This app represents the visual layer of the broader Second Brain Database API suite: a platform-independent, modular ecosystem built for managing thoughts, tasks, emotions, and long-term knowledge — all powered by MongoDB, Flask, and micro frontends.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This is the only macro frontend I offer for Second Brain Database.',
                    style: TextStyle(fontStyle: FontStyle.italic),
                  ),
                  SizedBox(height: 30),

                  // Why This Exists
                  Text(
                    '✨ Why This Exists',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'Most productivity systems are bloated, overly complex, or locked into ecosystems. Second Brain Database takes a different approach:',
                  ),
                  SizedBox(height: 8),
                  Text('• 📦 Centralized, not siloed'),
                  Text('• 🧩 Modular, not monolithic'),
                  Text('• 🛠️ Self-hostable, not dependent'),
                  Text('• 🌱 Minimal, not overwhelming'),
                  SizedBox(height: 10),
                  Text('This frontend is crafted to be:'),
                  Text('• Production-ready'),
                  Text('• Design-consistent'),
                  Text('• Simple to maintain'),
                  Text('• Genuinely useful'),
                  SizedBox(height: 10),
                  Text(
                    '“I prioritize quality over quantity. This isn’t an app with daily updates — it’s built to last, and built to evolve slowly with intent.”',
                    style: TextStyle(fontStyle: FontStyle.italic),
                  ),
                  SizedBox(height: 30),

                  // Features
                  Text(
                    '🧰 Features',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text('• Dynamic theme support (Light/Dark Mode)'),
                  Text('• Visual-first interface using banners and clear UX hierarchy'),
                  Text('• Support for modular tools like Emotion Tracker, Thought Capture, and the full Second Brain Database Suite'),
                  Text('• Open-source and community-focused architecture'),
                  SizedBox(height: 30),

                  // Tech Stack
                  Text(
                    '🔧 Tech Stack',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text('• Flutter – Frontend'),
                  Text('• MongoDB – Backend data storage'),
                  Text('• Flask – API gateway'),
                  Text('• Micro Frontends – Tool-specific modules'),
                  SizedBox(height: 30),

                  // Philosophy
                  Text(
                    '🚀 Philosophy',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    '“Centralize without compromise.”',
                    style: TextStyle(fontStyle: FontStyle.italic, fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Second Brain isn’t just any other knowledge management app. It’s a philosophy for building your own digital sanctuary — one that grows with your thoughts, not against them.',
                  ),
                  SizedBox(height: 30),

                  // Updates
                  Text(
                    '📬 Updates',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text('Updates to this frontend will be rare and intentional.'),
                  Text('I ship when something is complete and meaningful, not just new.'),
                  SizedBox(height: 10),
                  Text('You can expect:'),
                  Text('• ⚙️ Stability over churn'),
                  Text('• 🧪 Thorough testing'),
                  Text('• 💬 Community listening'),
                  SizedBox(height: 30),

                  // Contributions
                  Text(
                    '🤝 Contributions',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text('While this frontend is highly curated, thoughtful contributions are always welcome — especially for:'),
                  Text('• UI/UX refinement'),
                  Text('• Theme packs'),
                  Text('• Performance optimizations'),
                  Text('• Accessibility improvements'),
                  SizedBox(height: 30),

                  // License
                  Text(
                    '🪪 License',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 10),
                  Text(
                    'This project is released under the MIT License. Free to use, fork, and build your own brain 🧠✨',
                  ),
                  SizedBox(height: 40),

                  // Signature quote
                  Center(
                    child: Text(
                      '"Build your mind. Keep it yours."',
                      style: TextStyle(
                        fontStyle: FontStyle.italic,
                        color: Colors.grey,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
