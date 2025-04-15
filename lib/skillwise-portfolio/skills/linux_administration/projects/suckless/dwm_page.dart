import 'package:flutter/material.dart';

class DwmPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('dwm (dynamic window manager)'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'dwm (dynamic window manager) is a dynamic window manager for X. Source: dwm Repository.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
