import 'package:flutter/material.dart';
import 'package:rohanbatra/main.dart';
import 'package:rohanbatra/professional-experience/index.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rohanbatra/education/index.dart';
import 'package:rohanbatra/non-profit-work/index.dart'; // Import the new screen
import 'package:rohanbatra/skillwise-portfolio/index.dart'; // Import the updated screen
import 'package:rohanbatra/widgets/download_popup.dart'; // Import the new popup widget
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:rohanbatra/hobbies/index.dart'; // Import the new Hobbies screen
import 'package:rohanbatra/socials/index.dart';
import 'package:rohanbatra/donate/index.dart';
import 'package:rohanbatra/home/contact_us_page.dart';
import 'package:url_launcher/url_launcher.dart';

class SidebarWidget extends StatefulWidget {
  @override
  _SidebarWidgetState createState() => _SidebarWidgetState();
}

class _SidebarWidgetState extends State<SidebarWidget> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int? _splashDuration;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
    // Removed _loadThemePreference as it's now handled in main.dart
    _loadSplashDuration();
  }

  Future<void> _saveThemePreference(bool isDarkMode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', isDarkMode);
  }

  Future<void> _loadSplashDuration() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _splashDuration = prefs.getInt('splashDuration') ?? 3;
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleDrawer() {
    if (_animationController.isDismissed) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: <Widget>[
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.light
                      ? Colors.white // White in light mode
                      : Theme.of(context).primaryColor, // Default in dark mode
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundImage: AssetImage('assets/logos/Rohan-Batra/logo.png'),
                      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Rohan Batra',
                      style: TextStyle(
                        color: Theme.of(context).textTheme.titleLarge?.color,
                        fontSize: 24,
                      ),
                    ),
                  ],
                ),
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.home, size: 18), // Adjust icon size
                title: Text('Home'),
                onTap: () {
                  // Handle navigation to home
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.graduationCap, size: 18), // Adjust icon size
                title: Text('Education'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => FormalEducationIndexPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.briefcase, size: 18), // Adjust icon size
                title: Text('Professional Experience'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => ProfessionalExperienceIndexPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              
              ListTile(
                leading: Icon(FontAwesomeIcons.handsHelping, size: 18), // Adjust icon size
                title: Text('Non-Profit Work'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => NonProfitWorkIndexPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.folderOpen, size: 18), // Adjust icon size
                title: Text('Portfolio'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => PortfolioPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.smile, size: 18), // Adjust icon size
                title: Text('Hobbies'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => HobbiesIndexPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.users, size: 18), // Socials icon
                title: Text('Socials'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => SocialsIndexPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.donate, size: 18), // Donate icon
                title: Text('Donate'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => DonatePage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.envelope, size: 18), // Envelope icon
                title: Text('Get in Touch'),
                onTap: () {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) => ContactUsPage(),
                      transitionsBuilder: (context, animation, secondaryAnimation, child) {
                        const begin = Offset(1.0, 0.0); // Slide in from the right
                        const end = Offset.zero;
                        const curve = Curves.easeInOut;

                        var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
                        var offsetAnimation = animation.drive(tween);

                        return SlideTransition(
                          position: offsetAnimation,
                          child: child,
                        );
                      },
                    ),
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.blog, size: 18), // Blog icon
                title: Text('Blog'),
                onTap: () async {
                  final url = Uri.parse('https://blog.rohanbatra.in');
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.cog, size: 18), // Adjust icon size
                title: Text('Settings'),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return Dialog(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Container(
                          padding: EdgeInsets.all(20),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.8,
                            maxHeight: MediaQuery.of(context).size.height * 0.6,
                          ),
                          child: StatefulBuilder(
                            builder: (BuildContext context, StateSetter setModalState) {
                              return Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Settings',
                                        style: TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 20),
                                  Text(
                                    'Appearance',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SwitchListTile(
                                    title: Text('Dark Mode'),
                                    value: themeNotifier.value == ThemeMode.dark,
                                    onChanged: (bool value) {
                                      setModalState(() {
                                        themeNotifier.value =
                                            value ? ThemeMode.dark : ThemeMode.light;
                                        _saveThemePreference(value); // Save preference
                                      });
                                    },
                                  ),
                                  SizedBox(height: 20),
                                  Text(
                                    'Splash Animation Duration',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  StatefulBuilder(
                                    builder: (context, setSliderState) {
                                      return Column(
                                        children: [
                                          Slider(
                                            value: (_splashDuration ?? 3).toDouble(),
                                            min: 3,
                                            max: 10,
                                            divisions: 7,
                                            label: '${_splashDuration ?? 3} seconds',
                                            onChanged: (double value) async {
                                              setSliderState(() {
                                                _splashDuration = value.round();
                                              });
                                              setModalState(() {});
                                              final prefs = await SharedPreferences.getInstance();
                                              await prefs.setInt('splashDuration', _splashDuration!);
                                            },
                                          ),
                                          Text('${_splashDuration ?? 3} seconds'),
                                        ],
                                      );
                                    },
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
              ListTile(
                leading: Icon(FontAwesomeIcons.download, size: 18), // Adjust icon size
                title: Text('Download'),
                onTap: () {
                  Navigator.of(context).pop(); // Collapse the sidebar
                  showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return DownloadPopup(); // Use the new popup widget
                    },
                  );
                },
              ),
            ],
          ),
        ),
        Positioned(
          left: 275, // Align to the left edge of the sidebar
          top: MediaQuery.of(context).size.height / 2 - 28, // Center vertically
          child: FloatingActionButton(
            mini: true,
            backgroundColor: Theme.of(context).brightness == Brightness.light
                ? Colors.grey[200] // Light mode background
                : Colors.grey[800], // Dark mode background
            foregroundColor: Theme.of(context).textTheme.bodyLarge?.color, // Icon color based on theme
            onPressed: () {
              Navigator.pop(context);
            },
            child: Icon(FontAwesomeIcons.arrowLeft, size: 18), // Back icon
          ),
        ),
      ],
    );
  }
}
