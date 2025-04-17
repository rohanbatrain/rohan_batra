import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'portfolio/portfolio_tile.dart';
import 'skills/cloud_computing/private_cloud_devops_tile.dart';
import 'skills/cyber_security/cyber_security_tile.dart';
import 'skills/full_stack_development/full_stack_development_tile.dart';
import 'skills/linux_administration/linux_administration_tile.dart';
import 'skills/automation/automation_tile.dart';
import 'skills/android_customization/android_customization_tile.dart';
import 'skills/web_development_tile.dart';
import 'skills/project_management_tile.dart';
import 'skills/gaming_tile.dart';

class PortfolioPage extends StatelessWidget {
  final List<String> mainPortfolio = ['Portfolio'];

  final List<String> skills = [
    'Cloud Computing',
    'Cyber Security',
    'Full-Stack Development',
    'Linux Administration',
    'Automation',
    ''
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
      backgroundColor: isDarkMode ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
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
                  return PortfolioTile(portfolio: mainPortfolio[index]);
                },
              ),
              SizedBox(height: 32),

              // Skillwise Portfolio Section
              _buildSectionHeader(context, 'Skillwise Portfolio'),
              SizedBox(height: 16),
              ListView(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                children: [
                  PrivateCloudDevOpsTile(),
                  CyberSecurityTile(),
                  FullStackDevelopmentTile(),
                  LinuxAdministrationTile(),
                  AutomationTile(),
                  AndroidCustomizationTile(),
                  WebDevelopmentTile(), // Added Web Development tile
                  ProjectManagementTile(), // Added Project Management tile
                  GamingTile(), // Added Gaming tile
                ],
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
