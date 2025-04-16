import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/github_actions_screen.dart';

class GitHubActionsTile extends StatelessWidget {
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
            MaterialPageRoute(builder: (context) => GitHubActionsScreen()),
          );
        },
        leading: const FaIcon(FontAwesomeIcons.github),
        title: const Text(
          'GitHub Actions',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('CI/CD workflows for automation.'),
      ),
    );
  }
}
