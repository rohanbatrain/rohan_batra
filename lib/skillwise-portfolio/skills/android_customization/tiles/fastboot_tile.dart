import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/fastboot_screen.dart';

class FastbootTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => FastbootScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.terminal),
        title: const Text(
          'Fastboot',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Tool for flashing Android devices.'),
      ),
    );
  }
}
