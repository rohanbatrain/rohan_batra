import 'package:flutter/material.dart';

class MinecraftScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Minecraft')),
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
                      ? 'assets/images/banners/minecraft/2.png'
                      : 'assets/images/banners/minecraft/1.png',
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.black : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.brown, width: 2),
                  ),
                  child: Text(
                    'BUILD. EXPLORE. SURVIVE.',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Colors.brown[700],
                      fontFamily: 'RobotoMono',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Minecraft Storyline Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'The Overworld Awaits',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.brown[700],
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.brown[900] : Colors.brown[50],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.brown, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Awaken in a world of endless blocks, where your only limit is your imagination. Gather resources, craft tools, and build your legacy. Beware the night, for monsters lurk in the shadows.',
                        style: TextStyle(
                          color: isDarkMode ? Colors.white70 : Colors.brown[900],
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Core Adventures:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.brown[700],
                        ),
                      ),
                      const SizedBox(height: 6),
                      _MinecraftObjective(text: '• Survive your first night.'),
                      _MinecraftObjective(text: '• Build your dream home.'),
                      _MinecraftObjective(text: '• Explore caves and dungeons.'),
                      _MinecraftObjective(text: '• Defeat the Ender Dragon.'),
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

class _MinecraftObjective extends StatelessWidget {
  final String text;

  const _MinecraftObjective({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Text(
        text,
        style: TextStyle(
          color: Theme.of(context).brightness == Brightness.dark
              ? Colors.white70
              : Colors.brown[900],
        ),
      ),
    );
  }
}
