import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class Dmenu extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('dmenu (dynamic menu)'),
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft), // Replaced Material icon with FontAwesome
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'A fast and lightweight dynamic menu for X.\n\nSource: dmenu Repository',
        ),
      ),
    );
  }
}
