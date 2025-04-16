import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/orangefox_screen.dart';

class OrangeFoxTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => OrangeFoxScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.firefox),
        title: const Text(
          'OrangeFox',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Custom recovery for Android devices.'),
      ),
    );
  }
}
