import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'widgets/portfolio_tile.dart';
import 'widgets/skill_tile.dart';

class PortfolioPage extends StatelessWidget {
  final List<Map<String, dynamic>> mainPortfolio = [
    {'title': 'Portfolio', 'description': 'A collection of my projects and achievements.'},
  ];

  final List<Map<String, dynamic>> skills = [
    {'title': 'Cloud Computing', 'description': 'Experience with AWS, Azure, and Google Cloud.', 'icon': FontAwesomeIcons.cloud},
    {'title': 'Cyber Security', 'description': 'Expertise in penetration testing and secure software development.', 'icon': FontAwesomeIcons.shieldAlt},
    {'title': 'Full-Stack Development', 'description': 'Proficient in building scalable web and mobile applications.', 'icon': FontAwesomeIcons.code},
    {'title': 'Linux Administration', 'description': '5+ years of experience in Linux system administration.', 'icon': FontAwesomeIcons.linux},
    {'title': 'Automation', 'description': 'Skilled in automating workflows and processes using scripting languages.', 'icon': FontAwesomeIcons.robot},
  ];

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('Portfolio'),
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
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Main Portfolio Section
              _buildSectionHeader(context, 'Main Portfolio'),
              SizedBox(height: 16),
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: mainPortfolio.length,
                itemBuilder: (context, index) {
                  return PortfolioTile(
                    item: mainPortfolio[index],
                    icon: FontAwesomeIcons.folder,
                  );
                },
              ),
              SizedBox(height: 32),

              // Skillwise Portfolio Section
              _buildSectionHeader(context, 'Skillwise Portfolio'),
              SizedBox(height: 16),
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: skills.length,
                itemBuilder: (context, index) {
                  return SkillTile(item: skills[index]);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 24,
          color: Theme.of(context).primaryColor,
        ),
        SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
