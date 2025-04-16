import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/make_screen.dart';

class MakeTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => MakeScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.diagramProject),
        title: const Text(
          'Make',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Visual automation platform for workflows.'),
      ),
    );
  }
}
