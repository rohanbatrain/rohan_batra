import 'package:flutter/material.dart';

class StPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('st (suckless terminal)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'st (suckless terminal) is a minimalist terminal emulator for X. Source: st Repository.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
