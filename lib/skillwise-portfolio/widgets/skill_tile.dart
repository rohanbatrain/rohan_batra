import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../screens/skill_screen.dart'; // Import the new screen

class SkillTile extends StatelessWidget {
  final Map<String, dynamic> item;

  const SkillTile({required this.item, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SkillScreen(item: item),
            ),
          );
        },
        leading: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            FaIcon(item['icon'], color: Theme.of(context).iconTheme.color),
            SizedBox(width: 12),
          ],
        ),
        contentPadding: EdgeInsets.all(16),
        title: Text(
          item['title']!,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        subtitle: Text(
          item['description']!,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.8),
              ),
        ),
      ),
    );
  }
}
