import 'package:flutter/material.dart';

class GitHubActionsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GitHub Actions'),
      ),
      body: const Center(
        child: Text('Details about GitHub Actions'),
      ),
    );
  }
}
