import 'package:flutter/material.dart';

class PortfolioPage extends StatelessWidget {
  final List<Map<String, String>> mainPortfolio = [
    {'title': 'Portfolio', 'description': 'A collection of my projects and achievements.'},
  ];

  final List<Map<String, String>> skills = [
    {'title': 'Cloud Computing', 'description': 'Experience with AWS, Azure, and Google Cloud.'},
    {'title': 'Cyber Security', 'description': 'Expertise in penetration testing and secure software development.'},
    {'title': 'Full-Stack Development', 'description': 'Proficient in building scalable web and mobile applications.'},
    {'title': 'Linux Administration', 'description': '5+ years of experience in Linux system administration.'},
    {'title': 'Automation', 'description': 'Skilled in automating workflows and processes using scripting languages.'},
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
          icon: ImageIcon(
            AssetImage(
              isDarkMode
                  ? 'assets/icons/icon_back-arrow-dark-bg.png'
                  : 'assets/icons/icon_back-arrow-light-bg.png',
            ),
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
              _buildPortfolioList(context, mainPortfolio),
              SizedBox(height: 32),

              // Skillwise Portfolio Section
              _buildSectionHeader(context, 'Skillwise Portfolio'),
              SizedBox(height: 16),
              _buildPortfolioList(context, skills),
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

  Widget _buildPortfolioList(BuildContext context, List<Map<String, String>> items) {
    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 6,
          margin: EdgeInsets.symmetric(vertical: 8),
          child: ListTile(
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
            // Removed trailing icon
          ),
        );
      },
    );
  }
}
