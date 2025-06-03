import 'package:flutter/material.dart';

class Anno1800Screen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Anno 1800')),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 32.0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 200,
                width: double.infinity,
                child: Image.asset(
                  isDarkMode
                      ? 'assets/images/banners/Anno-1800/2.png'
                      : 'assets/images/banners/Anno-1800/1.png',
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.blueGrey[900] : Colors.blueGrey[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber, width: 2),
                  ),
                  child: Text(
                    'FORGE YOUR EMPIRE.',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Colors.amber[800],
                      fontFamily: 'RobotoMono',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Anno 1800 Storyline Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'Dawn of a New Era',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.amber[800],
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.blueGrey[900] : Colors.blueGrey[50],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.amber, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Step into the age of industrialization. Build sprawling cities, manage trade routes, and navigate political intrigue as you forge your empire from humble beginnings to global dominance.',
                        style: TextStyle(
                          color: isDarkMode ? Colors.white70 : Colors.amber[900],
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Key Challenges:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.amber[800],
                        ),
                      ),
                      const SizedBox(height: 6),
                      _AnnoObjective(text: '• Establish efficient production chains.'),
                      _AnnoObjective(text: '• Expand to the New World.'),
                      _AnnoObjective(text: '• Balance diplomacy and warfare.'),
                      _AnnoObjective(text: '• Satisfy your citizens’ needs.'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _AnnoObjective extends StatelessWidget {
  final String text;
  const _AnnoObjective({required this.text});
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Text(
        text,
        style: TextStyle(
          color: isDark ? Colors.white70 : Colors.amber[900],
        ),
      ),
    );
  }
}
