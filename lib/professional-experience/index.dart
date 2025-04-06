import 'package:flutter/material.dart';

final List<Map<String, Map<String, String>>> companies = [
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
    'role': {'value': 'Co Founder'},
    'name': {'value': 'LinuxWale'},
    'logo': {
      
      'light': 'assets/logos/Linuxwale/Light-Mode/logo.png',
      'dark': 'assets/logos/Linuxwale/Dark-Mode/logo.png',
    },
    'employmentType': {'value': 'Part-Time'},
    'startDate': {'value': 'Sep 2023'},
    'endDate': {'value': 'Present'},
  },
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
];

class ProfessionalExperienceIndexPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text('Experience'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: ImageIcon(
            AssetImage(
              Theme.of(context).brightness == Brightness.dark
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
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor, // Use theme-based background color
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: kToolbarHeight + 16),
              Text(
                'My Professional Journey',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              SizedBox(height: 16),
              Text(
                'Here are some of the amazing companies I have collaborated with:',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              SizedBox(height: 24),
              Expanded(
                child: GridView.builder(
                  gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 310, // Slightly increased max width per tile
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: companies.length,
                  itemBuilder: (context, index) {
                    final company = companies[index];
                    return AnimatedTile(company: company);
                  },
                ),
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
    final logoPath = isDarkMode
        ? widget.company['logo']!['dark']!
        : widget.company['logo']!['light']!;
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
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            logoPath,
                            height: tileSize * 0.30, // Slightly reduced size
                            width: tileSize * 0.30,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                height: tileSize * 0.30,
                                width: tileSize * 0.30,
                                color: Colors.grey, // Placeholder background color
                                child: Icon(
                                  Icons.broken_image,
                                  size: tileSize * 0.15,
                                  color: Colors.white, // Placeholder icon color
                                ),
                              );
                            },
                          ),
                        ),
                        SizedBox(height: tileSize * 0.05), // Adjusted spacing
                        FittedBox(
                          child: Text(
                            widget.company['name']!['value']!,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: tileSize * 0.07, // Adjusted font size
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
