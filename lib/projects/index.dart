import 'package:flutter/material.dart';

class ProjectsIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Projects'),
        leading: IconButton(
          icon: ImageIcon(
            AssetImage(
              Theme.of(context).brightness == Brightness.dark
                  ? 'assets/icons/icon_back-arrow-dark-bg.png' // Dark mode icon
                  : 'assets/icons/icon_back-arrow-light-bg.png' // Light mode icon
            ),
          ),
          onPressed: () {
            Navigator.pop(context); // Navigate back
          },
        ),
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
