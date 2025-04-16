import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/ifttt_screen.dart';

class IftttTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => IftttScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.exchangeAlt),
        title: const Text(
          'IFTTT',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('If This Then That automation platform.'),
      ),
    );
  }
}
