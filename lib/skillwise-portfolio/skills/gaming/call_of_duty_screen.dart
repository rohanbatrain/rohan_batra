import 'package:flutter/material.dart';

class CallOfDutyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Call of Duty'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Call-of-duty/2.png'
                    : 'assets/images/banners/Call-of-duty/1.png',
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
                  border: Border.all(color: Colors.greenAccent, width: 2),
                ),
                child: Text(
                  'BRAVO SIX GOING DARK',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                    color: Colors.green[700],
                    fontFamily: 'RobotoMono',
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Notable Dialogues Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Notable Dialogues',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.amber[700],
                  letterSpacing: 1.2,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  _DialogueCard(
                    dialogue: '"Stay frosty."',
                    character: '— Soap MacTavish',
                  ),
                  _DialogueCard(
                    dialogue: '"The healthy human mind doesn\'t wake up in the morning thinking this is its last day on Earth."',
                    character: '— Captain Price',
                  ),
                  _DialogueCard(
                    dialogue: '"These aren\'t your average muppets. They\'re well trained."',
                    character: '— Gaz',
                  ),
                  _DialogueCard(
                    dialogue: '"It’s time to get to work."',
                    character: '— Ghost',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Mission Planning Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Mission Planning',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.greenAccent,
                  letterSpacing: 1.2,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                decoration: BoxDecoration(
                  color: isDarkMode ? Colors.grey[900] : Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.lock_open, color: Colors.blueAccent, size: 28),
                        const SizedBox(width: 8),
                        Text(
                          'Operation: The Gulag',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.blueAccent,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Reference: Rescue Captain Price (Prisoner 627) from the gulag.',
                      style: TextStyle(
                        fontStyle: FontStyle.italic,
                        color: isDarkMode ? Colors.white70 : Colors.black87,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Objectives:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isDarkMode ? Colors.white : Colors.black,
                      ),
                    ),
                    const SizedBox(height: 6),
                    _MissionObjective(text: '1. Infiltrate the gulag facility.'),
                    _MissionObjective(text: '2. Locate Prisoner 627.'),
                    _MissionObjective(text: '3. Extract Captain Price safely.'),
                    const SizedBox(height: 16),
                    Center(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[800],
                          padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 6,
                        ),
                        icon: const Icon(Icons.directions_run, color: Colors.white),
                        label: const Text(
                          'DEPLOY',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            letterSpacing: 2,
                            color: Colors.white,
                          ),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Row(
                                children: const [
                                  Icon(Icons.lock_open, color: Colors.yellow, size: 28),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'Mission started! Breach the gulag and free Captain Price. "Prisoner 627 is Captain Price!"',
                                      style: TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                              backgroundColor: Colors.blueGrey,
                              duration: const Duration(seconds: 4),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _DialogueCard extends StatelessWidget {
  final String dialogue;
  final String character;

  const _DialogueCard({
    required this.dialogue,
    required this.character,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: ListTile(
        title: Text(
          dialogue,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(character),
      ),
    );
  }
}

class _MissionObjective extends StatelessWidget {
  final String text;

  const _MissionObjective({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.check_circle, color: Colors.green),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 16),
          ),
        ),
      ],
    );
  }
}
