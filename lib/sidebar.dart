import 'package:flutter/material.dart';
import 'package:rohan_batra/main.dart';
import 'package:rohan_batra/professional-experience/index.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rohan_batra/education/index.dart';
import 'package:rohan_batra/non-profit-work/index.dart'; // Import the new screen
import 'package:rohan_batra/skillwise-portfolio/index.dart'; // Import the updated screen
import 'package:rohan_batra/widgets/download_popup.dart'; // Import the new popup widget
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SidebarWidget extends StatefulWidget {
  @override
  _SidebarWidgetState createState() => _SidebarWidgetState();
}

class _SidebarWidgetState extends State<SidebarWidget> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
    // Removed _loadThemePreference as it's now handled in main.dart
  }

  Future<void> _saveThemePreference(bool isDarkMode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', isDarkMode);
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
                      : Theme.of(context).scaffoldBackgroundColor, // Match other screens in dark mode
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
                : Theme.of(context).scaffoldBackgroundColor, // Match other screens in dark mode
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
