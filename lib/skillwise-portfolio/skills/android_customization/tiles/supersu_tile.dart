import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/supersu_screen.dart';

class SuperSuTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => SuperSuScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.shieldAlt),
        title: const Text(
          'SuperSU',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Root management for Android devices.'),
      ),
    );
  }
}
