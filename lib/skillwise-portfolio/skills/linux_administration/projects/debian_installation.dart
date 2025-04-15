import 'package:flutter/material.dart';

class DebianInstallation extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Debian Installation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Your first OS installation on the system drive to overcome Windows’ sluggish performance on older hardware.',
        ),
      ),
    );
  }
}
