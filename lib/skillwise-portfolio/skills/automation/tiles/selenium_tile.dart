import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/selenium_screen.dart';

class SeleniumTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => SeleniumScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.robot),
        title: const Text(
          'Selenium',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Automate web browsers for testing.'),
      ),
    );
  }
}
