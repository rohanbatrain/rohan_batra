import 'package:flutter/material.dart';

class St extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('st (suckless terminal)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A minimalist terminal emulator for X.\n\nSource: st Repository',
        ),
      ),
    );
  }
}
