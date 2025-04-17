import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../../professional-experience/secret_startup_page.dart';

class RelatedToSection extends StatelessWidget {
  final String description;
  final Widget screen; // Added screen parameter

  const RelatedToSection({Key? key, required this.description, required this.screen}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0), // Reduced padding
      child: Card(
        elevation: 2, // Reduced elevation
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8), // Smaller border radius
        ),
        child: Padding(
          padding: const EdgeInsets.all(12.0), // Reduced padding
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const FaIcon(
                    FontAwesomeIcons.building,
                    size: 24, // Reduced icon size
                    color: Colors.blue,
                  ),
                  const SizedBox(width: 6), // Reduced spacing
                  const Text(
                    'Related To:',
                    style: TextStyle(
                      fontSize: 18, // Reduced font size
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8), // Reduced spacing
              Text(
                description,
                style: const TextStyle(fontSize: 16), // Reduced font size
              ),
              const SizedBox(height: 12), // Reduced spacing
              Center(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => screen, // Navigate to the provided screen
                      ),
                    );
                  },
                  icon: const Icon(Icons.arrow_forward, size: 20), // Reduced icon size
                  label: const Text(
                    'Learn More',
                    style: TextStyle(fontSize: 16), // Reduced font size
                  ),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20, // Reduced horizontal padding
                      vertical: 10, // Reduced vertical padding
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
