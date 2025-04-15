import 'package:flutter/material.dart';

class Dmenu extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('dmenu (dynamic menu)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A fast and lightweight dynamic menu for X.\n\nSource: dmenu Repository',
        ),
      ),
    );
  }
}
