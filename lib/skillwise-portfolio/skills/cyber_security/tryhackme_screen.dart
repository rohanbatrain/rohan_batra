import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class TryHackMeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('TryHackMe'),
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Resize banner to take half the screen height
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.45,
              child: Image.asset(
                Theme.of(context).brightness == Brightness.dark
                    ? 'assets/images/banners/THM/2.png'
                    : 'assets/images/banners/THM/1.png',
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 16),
            Center(),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Badges Awarded',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Card(
                elevation: 4,
                child: ListTile(
                  leading: Icon(Icons.badge, color: Colors.blue),
                  title: Text('cat linux.txt'),
                  subtitle: Text('Being competent in Linux'),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Completed Rooms',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  _buildRoomTile(
                    title: 'Offensive Security Intro',
                    description:
                        'Hack your first website (legally in a safe environment) and experience an ethical hacker\'s job.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.shieldAlt,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Networking Concepts',
                    description:
                        'Learn about the ISO OSI model and the TCP/IP protocol suite.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.networkWired,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Intro to Logs',
                    description:
                        'Learn the fundamentals of logging, data sources, collection methods and principles to step into the log analysis world.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.fileAlt,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Defensive Security Intro',
                    description:
                        'Introducing defensive security and related topics, such as Threat Intelligence, SOC, DFIR, Malware Analysis, and SIEM.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.lock,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Careers in Cyber',
                    description:
                        'Learn about the different careers in cyber security.',
                    difficulty: 'info',
                    icon: FontAwesomeIcons.briefcase,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'What is Networking?',
                    description:
                        'Begin learning the fundamentals of computer networking in this bite-sized and interactive module.',
                    difficulty: 'info',
                    icon: FontAwesomeIcons.networkWired,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Security Principles',
                    description:
                        'Learn about the security triad and common security models and principles.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.shieldAlt,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Linux File System Analysis',
                    description:
                        'Perform real-time file system analysis on a Linux system to identify an attacker\'s artefacts.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.linux,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Python Basics',
                    description:
                        'Using a web-based code editor, learn the basics of Python and put your knowledge into practice by eventually coding a short Bitcoin investment project.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.python,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Linux Fundamentals Part 1',
                    description:
                        'Embark on the journey of learning the fundamentals of Linux. Learn to run some of the first essential commands on an interactive terminal.',
                    difficulty: 'info',
                    icon: FontAwesomeIcons.linux,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Phishing Analysis Fundamentals',
                    description: 'Learn all the components that make up an email.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.envelope,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Introductory Networking',
                    description:
                        'An introduction to networking theory and basic networking tools.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.networkWired,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Active Reconnaissance',
                    description:
                        'Learn how to use simple tools such as traceroute, ping, telnet, and a web browser to gather information.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.search,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Passive Reconnaissance',
                    description:
                        'Learn about the essential tools for passive reconnaissance, such as whois, nslookup, and dig.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.eye,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Anthem',
                    description:
                        'Exploit a Windows machine in this beginner level challenge.',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.windows,
                    context: context,
                  ),
                  _buildRoomTile(
                    title: 'Google Dorking',
                    description:
                        'Explaining how Search Engines work and leveraging them into finding hidden content!',
                    difficulty: 'easy',
                    icon: FontAwesomeIcons.google,
                    context: context,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildRoomTile({
    required String title,
    required String description,
    required String difficulty,
    required IconData icon,
    required BuildContext context,
  }) {
    return Card(
      elevation: 6,
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16.0),
        leading: Padding(
          padding: const EdgeInsets.only(right: 12.0), // Adjusted padding for uniform spacing
          child: FaIcon(
            icon,
            size: 32,
            color: Theme.of(context).iconTheme.color, // Updated to use Theme
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(
            description,
            style: TextStyle(fontSize: 14, color: Colors.grey[700]),
          ),
        ),
        trailing: Chip(
          label: Text(
            difficulty.toUpperCase(),
            style: TextStyle(color: Colors.white),
          ),
          backgroundColor: difficulty == 'easy'
              ? Colors.green
              : difficulty == 'info'
                  ? Colors.blue
                  : Colors.orange,
        ),
      ),
    );
  }
}
