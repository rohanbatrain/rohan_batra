import 'package:flutter/material.dart';
import 'garuda_screen.dart';

class GarudaTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: const Text('Garuda'),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => GarudaScreen()),
        );
      },
    );
  }
}
