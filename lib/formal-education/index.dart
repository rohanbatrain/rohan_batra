import 'package:flutter/material.dart';

class FormalEducationIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hello World'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: ImageIcon(
            AssetImage(
              Theme.of(context).brightness == Brightness.dark
                  ? 'assets/icons/icon_back-arrow-dark-bg.png'
                  : 'assets/icons/icon_back-arrow-light-bg.png',
            ),
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        iconTheme: IconThemeData(
          color: Theme.of(context).iconTheme.color,
        ),
      ),
      body: Center(
        child: Text(
          'Hello World',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}
