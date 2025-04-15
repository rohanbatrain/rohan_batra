import 'package:flutter/material.dart';

class LinuxScriptsRepository extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Linux Scripts Repository'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A collection of scripts you’ve developed to automate and streamline your Linux administration tasks.\n\nSource: Scripts Repository',
        ),
      ),
    );
  }
}
