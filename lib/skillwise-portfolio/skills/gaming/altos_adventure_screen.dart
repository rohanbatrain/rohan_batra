import 'package:flutter/material.dart';

class AltosAdventureScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text("Alto's Adventure")),
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
                      ? 'assets/images/banners/Alto-Adventure/2.png'
                      : 'assets/images/banners/Alto-Adventure/1.png',
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.indigo[900] : Colors.indigo[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.indigoAccent, width: 2),
                  ),
                  child: Text(
                    'THE MOUNTAIN CALLS.',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Colors.indigo[700],
                      fontFamily: 'RobotoMono',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // Alto's Adventure Storyline Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'Endless Mountain Odyssey',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.indigo[700],
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.indigo[900] : Colors.indigo[50],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.indigoAccent, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Embark on a serene yet thrilling journey down alpine slopes. Rescue runaway llamas, leap over chasms, and weather the elements as you chase the high score and the perfect run.',
                        style: TextStyle(
                          color: isDarkMode ? Colors.white70 : Colors.indigo[900],
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Core Adventures:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.indigo[700],
                        ),
                      ),
                      const SizedBox(height: 6),
                      _AltoObjective(text: '• Rescue runaway llamas.'),
                      _AltoObjective(text: '• Perform backflips and combos.'),
                      _AltoObjective(text: '• Brave thunderstorms and blizzards.'),
                      _AltoObjective(text: '• Discover mountain elders.'),
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

class _AltoObjective extends StatelessWidget {
  final String text;
  const _AltoObjective({required this.text});
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Text(
        text,
        style: TextStyle(
          color: isDark ? Colors.white70 : Colors.indigo[900],
        ),
      ),
    );
  }
}
