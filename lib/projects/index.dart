import 'package:flutter/material.dart';

class ProjectsIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Projects'),
        iconTheme: IconThemeData(
          color: Theme.of(context).iconTheme.color, // Ensure proper contrast
        ),
      ),
      body: Center(
        child: Text('Welcome to the Projects Page!'),
      ),
    );
  }
}
