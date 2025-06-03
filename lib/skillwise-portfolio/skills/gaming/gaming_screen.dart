import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'minecraft_screen.dart';
import 'call_of_duty_screen.dart';
import 'altos_adventure_screen.dart';
import 'anno_1800_screen.dart';
import 'bgmi_screen.dart';

class GamingScreen extends StatelessWidget {
  final List<Map<String, dynamic>> pcGames = [
    {
      'icon': FontAwesomeIcons.crosshairs,
      'title': "Call of Duty Series",
      'description': "First-person shooter franchise.",
      'screen': CallOfDutyScreen(),
    },
    {
      'icon': FontAwesomeIcons.cube,
      'title': "Minecraft",
      'description': "Sandbox building and adventure game.",
      'screen': MinecraftScreen(),
    },
    {
      'icon': FontAwesomeIcons.mountain,
      'title': "Alto's Adventure",
      'description': "Endless snowboarding odyssey.",
      'screen': AltosAdventureScreen(),
    },
    {
      'icon': FontAwesomeIcons.city,
      'title': "Anno 1800",
      'description': "City-building real-time strategy game.",
      'screen': Anno1800Screen(),
    },
  ];

  final List<Map<String, dynamic>> androidGames = [
    {
      'icon': FontAwesomeIcons.gamepad,
      'title': "BGMI",
      'description': "Battle royale mobile game.",
      'screen': BGMIScreen(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(title: const Text('Gaming')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('PC Gaming', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...pcGames.map((game) {
                final isFavorite = game['title'] == "Call of Duty Series";
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                  margin: const EdgeInsets.symmetric(vertical: 6),
                  color: isFavorite ? Colors.green[50] : null,
                  child: ListTile(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => game['screen']));
                    },
                    leading: Stack(
                      alignment: Alignment.topRight,
                      children: [
                        CircleAvatar(
                          backgroundColor: isDark ? Colors.grey[800] : Colors.white,
                          child: Icon(game['icon'], color: isDark ? Colors.white : Colors.black),
                        ),
                        if (isFavorite)
                          const Icon(Icons.star, color: Colors.amber, size: 18),
                      ],
                    ),
                    title: Row(
                      children: [
                        Text(game['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                        if (isFavorite)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.amber[700],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'FAVORITE',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                      ],
                    ),
                    subtitle: Text(game['description']),
                  ),
                );
              }),
              const SizedBox(height: 24),
              const Text('Android Gaming', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...androidGames.map((game) => Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 4,
                margin: const EdgeInsets.symmetric(vertical: 6),
                child: ListTile(
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => game['screen']));
                  },
                  leading: CircleAvatar(
                    backgroundColor: isDark ? Colors.grey[800] : Colors.white,
                    child: Icon(game['icon'], color: isDark ? Colors.white : Colors.black),
                  ),
                  title: Text(game['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(game['description']),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }
}
