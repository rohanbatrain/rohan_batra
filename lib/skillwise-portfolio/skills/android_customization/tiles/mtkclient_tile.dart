import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/mtkclient_screen.dart';

class MtkClientTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => MtkClientScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.microchip),
        title: const Text(
          'MTKClient ISO',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Unbrick and flash MediaTek-based devices.'),
      ),
    );
  }
}
