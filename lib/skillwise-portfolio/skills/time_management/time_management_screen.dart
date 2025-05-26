import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'clockify_screen.dart';

class TimeManagementScreen extends StatelessWidget {
  final List<Map<String, dynamic>> tools = [
    {
      'icon': FontAwesomeIcons.clock,
      'title': 'Clockify',
      'description': 'Track time, manage tasks, and boost productivity with Clockify.',
      'color': Colors.blue
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Time Management'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Time Management',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Master your time and productivity using top tools.',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.separated(
                itemCount: tools.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final tool = tools[index];
                  final isDark = Theme.of(context).brightness == Brightness.dark;
                  void _navigateToScreen() {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => ClockifyScreen()));
                  }
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 4,
                    child: ListTile(
                      onTap: _navigateToScreen,
                      leading: CircleAvatar(
                        backgroundColor: isDark ? Colors.grey[800] : Colors.white,
                        child: Icon(
                          tool['icon'],
                          color: isDark ? Colors.white : Colors.black,
                        ),
                      ),
                      title: Text(tool['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(tool['description']),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
