import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/odin_screen.dart';

class OdinTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => OdinScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.hammer),
        title: const Text(
          'Odin',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Samsung firmware flashing tool.'),
      ),
    );
  }
}
