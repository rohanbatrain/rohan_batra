import 'package:flutter/material.dart';

class LinuxConfigurationRepository extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Linux Configuration Repository'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A repository containing your custom configurations for various Linux setups.\n\nSource: Configs Repository',
        ),
      ),
    );
  }
}
