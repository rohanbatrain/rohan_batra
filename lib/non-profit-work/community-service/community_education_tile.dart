import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class CommunityEducationTile extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 4,
      margin: EdgeInsets.symmetric(vertical: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListTile(
          leading: Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: FaIcon(
              FontAwesomeIcons.chalkboardTeacher,
              color: Theme.of(context).iconTheme.color,
            ),
          ),
          title: Text(
            'Community Education',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          subtitle: Text(
            'Organized workshops and seminars to educate the community on technology and cybersecurity.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ),
    );
  }
}
