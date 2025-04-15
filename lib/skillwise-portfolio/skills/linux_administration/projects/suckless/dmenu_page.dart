import 'package:flutter/material.dart';

class DmenuPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('dmenu (dynamic menu)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'dmenu (dynamic menu) is a fast and lightweight dynamic menu for X. Source: dmenu Repository.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
