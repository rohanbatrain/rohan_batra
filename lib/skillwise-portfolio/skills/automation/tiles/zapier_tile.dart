import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/zapier_screen.dart';

class ZapierTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => ZapierScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.plug),
        title: const Text(
          'Zapier',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Connect apps and automate workflows.'),
      ),
    );
  }
}
