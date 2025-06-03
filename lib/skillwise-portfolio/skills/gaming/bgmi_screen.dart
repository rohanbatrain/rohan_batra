import 'package:flutter/material.dart';

class BGMIScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('BGMI')),
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
                      ? 'assets/images/banners/BGMI/2.png'
                      : 'assets/images/banners/BGMI/1.png',
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 22),
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.grey[900] : Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.redAccent, width: 2),
                  ),
                  child: Text(
                    'SURVIVE TILL THE END.',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Colors.red[700],
                      fontFamily: 'RobotoMono',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              // BGMI Storyline Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'Battle Royale Survival',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.red[700],
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Container(
                  decoration: BoxDecoration(
                    color: isDarkMode ? Colors.grey[900] : Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.redAccent, width: 2),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Drop onto the battleground, scavenge for weapons, and outlast your opponents. Only the sharpest survive as the playzone shrinks and the tension rises. Will you claim the Chicken Dinner?',
                        style: TextStyle(
                          color: isDarkMode ? Colors.white70 : Colors.red[900],
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Survival Tips:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.red[700],
                        ),
                      ),
                      const SizedBox(height: 6),
                      _BGMIObjective(text: '• Land strategically.'),
                      _BGMIObjective(text: '• Keep an eye on the playzone.'),
                      _BGMIObjective(text: '• Use cover and stay alert.'),
                      _BGMIObjective(text: '• Be the last one standing.'),
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

class _BGMIObjective extends StatelessWidget {
  final String text;
  const _BGMIObjective({required this.text});
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Text(
        text,
        style: TextStyle(
          color: isDark ? Colors.white70 : Colors.red[900],
        ),
      ),
    );
  }
}
