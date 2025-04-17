import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'docker_screen.dart';

class DockerTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: const EdgeInsets.all(8),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => DockerScreen()),
          );
        },
        leading: Image.asset(
          isDarkMode
              ? 'assets/images/icons/Docker/darkmode-icon.png'
              : 'assets/images/icons/Docker/lightmode-icon.png',
          width: 40,
          height: 40,
          errorBuilder: (context, error, stackTrace) => FaIcon(
            FontAwesomeIcons.docker,
            size: 40,
            color: Colors.grey,
          ),
        ),
        title: const Text(
          'Docker',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Explore containerization with Docker.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
