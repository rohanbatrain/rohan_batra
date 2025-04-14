import 'package:flutter/material.dart';
import 'pfsense_screen.dart';

class PfsenseTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: const Text('PFSense'),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => PfsenseScreen()),
        );
      },
    );
  }
}
