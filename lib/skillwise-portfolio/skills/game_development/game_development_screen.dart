import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'unity_screen.dart';
import 'unreal_engine_screen.dart';
import 'godot_screen.dart';
import 'renpy_screen.dart';

class GameDevelopmentScreen extends StatelessWidget {
  final List<Map<String, dynamic>> tools = [
    {
      'icon': FontAwesomeIcons.cube,
      'title': 'Unity',
      'description': 'Popular cross-platform game engine for 2D/3D games.',
      'screen': UnityScreen(),
    },
    {
      'icon': FontAwesomeIcons.shapes,
      'title': 'Unreal Engine',
      'description': 'AAA-quality game engine with Blueprint scripting.',
      'screen': UnrealEngineScreen(),
    },
    {
      'icon': FontAwesomeIcons.chessBoard,
      'title': 'Godot',
      'description': 'Open-source, lightweight, and flexible game engine.',
      'screen': GodotScreen(),
    },
    {
      'icon': FontAwesomeIcons.bookOpen,
      'title': "Ren'Py",
      'description': 'Visual novel engine for creating story-based games.',
      'screen': RenpyScreen(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Development'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Game Development',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Explore top tools and engines for building games.',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                itemCount: tools.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final tool = tools[index];
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                    child: ListTile(
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => tool['screen']));
                      },
                      leading: CircleAvatar(
                        backgroundColor: isDark ? Colors.grey[800] : Colors.white,
                        child: Icon(
                          tool['icon'],
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      title: Text(tool['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(tool['description']),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
