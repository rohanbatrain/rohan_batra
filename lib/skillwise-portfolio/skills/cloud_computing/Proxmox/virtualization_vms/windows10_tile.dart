import 'package:flutter/material.dart';
import 'windows10_screen.dart';

class Windows10Tile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: const Text('Windows 10'),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => Windows10Screen()),
        );
      },
    );
  }
}
