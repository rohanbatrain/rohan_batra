import 'package:flutter/material.dart';

class Dwm extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('dwm (dynamic window manager)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A dynamic window manager for X.\n\nSource: dwm Repository',
        ),
      ),
    );
  }
}
