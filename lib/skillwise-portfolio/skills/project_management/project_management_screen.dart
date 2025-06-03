import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'tiles/trello_screen.dart';
import 'tiles/asana_screen.dart';
import 'tiles/clickup_screen.dart';
import 'tiles/monday_screen.dart';

class ProjectManagementScreen extends StatelessWidget {
  final List<Map<String, dynamic>> tools = [
    {
      'icon': FontAwesomeIcons.arrowAltCircleUp,
      'title': 'ClickUp',
      'description': 'All-in-one platform with docs, goals, and time tracking',
      'color': Colors.purple,
      'label': 'Most Recently Used',
    },
    {
      'icon': FontAwesomeIcons.calendarCheck,
      'title': 'Monday.com',
      'description': 'Highly customizable work management platform',
      'color': Colors.orange
    },
    {
      'icon': FontAwesomeIcons.tasks,
      'title': 'Asana',
      'description': 'Task assignments, timelines, and collaboration',
      'color': Colors.pink
    },
    {
      'icon': FontAwesomeIcons.trello,
      'title': 'Trello',
      'description': 'Simple Kanban-style boards (great for visual task tracking)',
      'color': Colors.blue
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Project Management'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Project Management',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'Master the skills of planning, executing, and managing projects efficiently using top tools.',
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
                  // Navigation logic for each tile
                  void _navigateToScreen() {
                    if (tool['title'] == 'Trello') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => TrelloScreen()));
                    } else if (tool['title'] == 'Asana') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => AsanaScreen()));
                    } else if (tool['title'] == 'ClickUp') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => ClickUpScreen()));
                    } else if (tool['title'] == 'Monday.com') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => MondayScreen()));
                    }
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
                      title: Row(
                        children: [
                          Text(tool['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          if (tool['label'] != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.purple.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                tool['label'],
                                style: const TextStyle(
                                  color: Colors.purple,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ]
                        ],
                      ),
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
