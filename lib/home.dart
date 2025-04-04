import 'package:flutter/material.dart';
import 'sidebar.dart'; // Import the SidebarWidget from a separate file

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home Page'),
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
      ),
      drawer: SidebarWidget(), // SidebarWidget is correctly used as a drawer
      body: Center(
        child: Text(
          'Welcome to the Home Page!',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}
