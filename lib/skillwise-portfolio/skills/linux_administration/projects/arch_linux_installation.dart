import 'package:flutter/material.dart';

class ArchLinuxInstallation extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Arch Linux Installation'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A deep-dive into Linux internals—learning about directory structure, partitions, and bootloaders, including initial challenges and eventual success.',
        ),
      ),
    );
  }
}
