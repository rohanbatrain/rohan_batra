import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'tiles/cooking_tile.dart'; // Import the CookingTile
import 'tiles/writer_tile.dart'; // Import the WriterTile
import 'tiles/videography_tile.dart'; // Import the VideographyTile
import 'tiles/photography_tile.dart'; // Import the PhotographyTile
import 'tiles/chess_tile.dart'; // Import the ChessTile
import 'tiles/shadow_boxing_tile.dart'; // Import the ShadowBoxingTile
import 'tiles/edutainment_tile.dart'; // Import the EdutainmentTile
import 'tiles/tech_tinkering_tile.dart'; // Import the TechTinkeringTile

class HobbiesIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Hobbies',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            FontAwesomeIcons.arrowLeft,
            color: Theme.of(context).iconTheme.color,
          ),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        iconTheme: IconThemeData(
          color: Theme.of(context).iconTheme.color,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hobbies',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 12),
            Text(
              'Explore my hobbies and interests that I pursue in my free time.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 28),
            CookingTile(),
            WriterTile(),
            VideographyTile(),
            PhotographyTile(),
            ChessTile(),
            ShadowBoxingTile(),
            EdutainmentTile(),
            TechTinkeringTile(), // Add TechTinkeringTile
          ],
        ),
      ),
    );
  }
}
