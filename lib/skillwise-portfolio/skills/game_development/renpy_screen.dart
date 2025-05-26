import 'package:flutter/material.dart';

class RenpyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Ren'Py")),
      body: const Center(child: Text("Ren'Py – Visual novel engine for creating story-based games.")),
    );
  }
}
