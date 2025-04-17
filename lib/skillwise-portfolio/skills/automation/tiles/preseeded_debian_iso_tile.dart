import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/preseeded_debian_iso_screen.dart';

class PreseededDebianISOTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => PreseededDebianISOScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.server),
        title: const Text(
          'Debian ISO',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Automate Debian installations with preseed files.'),
      ),
    );
  }
}
