import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohan_batra/professional-experience/secret_startup_page.dart';

final List<Map<String, Map<String, String>>> companies = [
  {
    'role': {'value': 'Open Source Contributor'},
    'name': {'value': 'Rohan Batra FOSS'},
    'logo': {
      'light': 'assets/logos/Rohan-Batra-FOSS/Light-Mode/logo.png',
      'dark': 'assets/logos/Rohan-Batra-FOSS/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Self Employed'},
    'startDate': {'value': 'Oct 2022'},
    'endDate': {'value': 'Present'},
  },
  {
    'role': {'value': 'Open Source Advocate'},
    'name': {'value': 'Second Brain Database'},
    'logo': {
      'light': 'assets/logos/Second-Brain-Database/Light-Mode/logo.png',
      'dark': 'assets/logos/Second-Brain-Database/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Part-Time'},
    'startDate': {'value': 'Nov 2024'},
    'endDate': {'value': 'Present'},
  },
  {
    'role': {'value': 'Gamer'},
    'name': {'value': 'Rohan Batra Gaming'},
    'logo': {
      'light': 'assets/logos/Rohan-Batra-Gaming/Light-Mode/logo.png',
      'dark': 'assets/logos/Rohan-Batra-Gaming/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Self Employed'},
    'startDate': {'value': 'Mar 2025'},
    'endDate': {'value': 'Present'},
  },
  {
    'role': {'value': 'Co Founder'},
    'name': {'value': 'LinuxWale'},
    'logo': {
      'light': 'assets/logos/Linuxwale/Light-Mode/logo.png',
      'dark': 'assets/logos/Linuxwale/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Part-Time'},
    'startDate': {'value': 'Sep 2023'},
    'endDate': {'value': 'Apr 2025'},
  },
  {
    'role': {'value': 'Co Founder'},
    'name': {'value': 'Kruxers'},
    'logo': {
      'light': 'assets/logos/Kruxers/Light-Mode/logo.png',
      'dark': 'assets/logos/Kruxers/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Part time'},
    'startDate': {'value': 'Nov 2020'},
    'endDate': {'value': 'Mar 2025'},
  },
  {
    'role': {'value': 'Founder'},
    'name': {'value': 'Ravage Gamer'},
    'logo': {
      'light': 'assets/logos/Ravage-Gamer/Mascots/Mascot.png',
      'dark': 'assets/logos/Ravage-Gamer/Mascots/Mascot.png',
    },
    'employmentType': {'value': 'Part time'},
    'startDate': {'value': 'Aug 2019'},
    'endDate': {'value': 'Dec 2019'},
  },
  {
    'role': {'value': 'Personal Project Creator'},
    'name': {'value': 'Rohan Batra'},
    'logo': {
      'light': 'assets/logos/Rohan-Batra/legacy-logo.png',
      'dark': 'assets/logos/Rohan-Batra/legacy-logo.png',
    },
    'employmentType': {'value': 'Independent'},
    'startDate': {'value': 'Jan 2018'},
    'endDate': {'value': 'Present'},
  },
  {
    'role': {'value': 'Solo Engineer'},
    'name': {'value': 'Secret Startup'},
    'logo': {
      'light': 'assets/logos/Secret-Startup/Light-Mode/logo.png',
      'dark': 'assets/logos/Secret-Startup/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Confidential'},
    'startDate': {'value': 'Several Years Ago'},
    'endDate': {'value': 'Present'},
  },

];

class ProfessionalExperienceIndexPage extends StatelessWidget {
  final List<Map<String, Map<String, String>>> startups = companies;
  final List<Map<String, String>> internships = [
    {
      'name': 'Coming Soon',
      'role': 'Intern',
      'employmentType': 'Internship',
      'startDate': '',
      'endDate': '',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text('Experience'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            FontAwesomeIcons.arrowLeft, // Changed to FontAwesome icon
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
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor, // Use theme-based background color
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: kToolbarHeight + 8),
              Text(
                'My Professional Journey',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              SizedBox(height: 8),
              Text(
                'Here are some of the amazing startups and projects I have collaborated with:',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: 20),
              // Startups & Projects Heading
              Padding(
                padding: const EdgeInsets.only(top: 16.0, bottom: 6.0),
                child: Text(
                  'Startups & Projects',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              GridView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 310, // Slightly increased max width per tile
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: startups.length,
                itemBuilder: (context, index) {
                  final company = startups[index];
                  return AnimatedTile(company: company);
                },
              ),
              // Internships Heading
              Padding(
                padding: const EdgeInsets.only(top: 28.0, bottom: 6.0),
                child: Text(
                  'Internships',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              GridView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 310,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: internships.length,
                itemBuilder: (context, index) {
                  final internship = internships[index];
                  return ComingSoonTile(internship: internship);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AnimatedTile extends StatefulWidget {
  final Map<String, Map<String, String>> company;

  const AnimatedTile({Key? key, required this.company}) : super(key: key);

  @override
  _AnimatedTileState createState() => _AnimatedTileState();
}

class _AnimatedTileState extends State<AnimatedTile> {
  double _scale = 1.0;
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final logoPath = widget.company['name']!['value']! == 'Secret Startup'
        ? null // Use emoji instead of an image for "Secret Startup"
        : (isDarkMode
            ? widget.company['logo']!['dark']!
            : widget.company['logo']!['light']!);
    return LayoutBuilder(
      builder: (context, constraints) {
        final tileSize = constraints.maxWidth; // Dynamically get the tile size
        return MouseRegion(
          onEnter: (_) {
            setState(() {
              _isHovered = true;
            });
          },
          onExit: (_) {
            setState(() {
              _isHovered = false;
            });
          },
          child: GestureDetector(
            onTap: () {
              if (widget.company['name']!['value']! == 'Secret Startup') {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => SecretStartupPage(),
                  ),
                );
              }
            },
            onTapDown: (_) {
              setState(() {
                _scale = 0.95;
              });
            },
            onTapUp: (_) {
              setState(() {
                _scale = 1.0;
              });
            },
            onTapCancel: () {
              setState(() {
                _scale = 1.0;
              });
            },
            child: AnimatedScale(
              scale: _scale,
              duration: Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              child: AnimatedContainer(
                duration: Duration(milliseconds: 300),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: _isHovered
                      ? [
                          BoxShadow(
                            color: Theme.of(context).brightness == Brightness.dark
                                ? Colors.white.withOpacity(0.1)
                                : Colors.black.withOpacity(0.1),
                            blurRadius: 12,
                            spreadRadius: 2,
                          ),
                        ]
                      : [],
                ),
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 6,
                  child: Padding(
                    padding: const EdgeInsets.all(6.0), // Further reduced padding
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (logoPath != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              logoPath,
                              height: tileSize * 0.30, // Logo size inside tile
                              width: tileSize * 0.30,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  height: tileSize * 0.30,
                                  width: tileSize * 0.30,
                                  color: Colors.grey,
                                  child: FaIcon(
                                    FontAwesomeIcons.image,
                                    size: tileSize * 0.15,
                                    color: Colors.white,
                                  ),
                                );
                              },
                            ),
                          )
                        else
                          Icon(
                            FontAwesomeIcons.userNinja, // Emoji for "Secret Startup"
                            size: tileSize * 0.30,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        SizedBox(height: tileSize * 0.05),
                        FittedBox(
                          child: Text(
                            widget.company['name']!['value']!,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: tileSize * 0.07,
                                ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        SizedBox(height: tileSize * 0.03),
                        FittedBox(
                          child: Text(
                            widget.company['role']!['value']!,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontSize: tileSize * 0.06,
                                ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        SizedBox(height: tileSize * 0.03),
                        FittedBox(
                          child: Text(
                            widget.company['employmentType']!['value']!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        SizedBox(height: tileSize * 0.03),
                        FittedBox(
                          child: Text(
                            '${widget.company['startDate']!['value']} - ${widget.company['endDate']!['value']}',
                            style: Theme.of(context).textTheme.bodySmall,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class ComingSoonTile extends StatelessWidget {
  final Map<String, String> internship;
  const ComingSoonTile({Key? key, required this.internship}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                FontAwesomeIcons.hourglassHalf,
                size: 48,
                color: Theme.of(context).colorScheme.primary,
              ),
              SizedBox(height: 16),
              Text(
                internship['name'] ?? '',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 8),
              Text(
                internship['employmentType'] ?? '',
                style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

