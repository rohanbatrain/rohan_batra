import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/n8n_screen.dart';

class N8nTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => N8nScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.projectDiagram),
        title: const Text(
          'n8n',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Workflow automation with open-source tools.'),
      ),
    );
  }
}
