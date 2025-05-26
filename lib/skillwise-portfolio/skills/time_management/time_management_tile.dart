import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'time_management_screen.dart';

class TimeManagementTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).brightness == Brightness.dark
        ? Colors.white
        : Colors.black;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: ListTile(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => TimeManagementScreen()),
            );
          },
          leading: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                FontAwesomeIcons.clock,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                size: 32,
              ),
              const SizedBox(width: 8),
            ],
          ),
          title: Text(
            'Time Management',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
          ),
          subtitle: Text(
            'Track time and boost productivity.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: textColor),
          ),
        ),
      ),
    );
  }
}
