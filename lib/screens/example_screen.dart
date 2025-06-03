import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: Text('My App'),
          leading: IconButton(
            icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ),
        body: Center(
          child: Text('Hello, world!'),
        ),
      ),
    );
  }
}

void main() {
  runApp(MyApp());
}