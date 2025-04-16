import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/adb_screen.dart';

class AdbTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => AdbScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.android),
        title: const Text(
          'ADB',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Android Debug Bridge for device management.'),
      ),
    );
  }
}
