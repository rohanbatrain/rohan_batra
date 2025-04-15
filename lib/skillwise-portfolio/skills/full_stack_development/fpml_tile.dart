import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart'; // Added import for FontAwesome

class FpmdTile extends StatelessWidget {
  final VoidCallback onTap;

  const FpmdTile({Key? key, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              FaIcon(
                FontAwesomeIcons.laptopCode, // FontAwesome icon for full-stack development
                size: 40,
                color: isDarkMode ? Colors.white : Colors.black,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  'FPML: Flutter, Python, MongoDB, Linux',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
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
