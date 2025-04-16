import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/magisk_screen.dart';

class MagiskTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => MagiskScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.magic),
        title: const Text(
          'Magisk',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Systemless root and module management.'),
      ),
    );
  }
}
