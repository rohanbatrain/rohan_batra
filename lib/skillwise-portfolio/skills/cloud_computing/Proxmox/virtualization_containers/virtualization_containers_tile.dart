import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'virtualization_containers_screen.dart';

class VirtualizationContainersTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
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
            MaterialPageRoute(builder: (context) => VirtualizationContainersScreen()),
          );
        },
        title: const Text(
          'Virtualization – Containers (Pihole)',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: const Text('Explore container virtualization with Pihole.'),
        trailing: const FaIcon(FontAwesomeIcons.arrowRight),
      ),
    );
  }
}
