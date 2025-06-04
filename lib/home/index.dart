import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'dart:async'; // Import the dart:async package
import 'package:font_awesome_flutter/font_awesome_flutter.dart'; // Import the FontAwesome package
import '../sidebar.dart';
import 'professional_summary.dart'; // Import the AboutMe widget
import 'professional_experience.dart'; // Import the ProfessionalExperience widget
import 'non_profit.dart'; // Import the NonProfit widget
import 'portfolio.dart'; // Import the Portfolio widget
import 'download.dart'; // Import the DownloadSection widget
import 'package:flutter_animate/flutter_animate.dart'; // Import the animate package
import 'contactus.dart'; // Import the ContactUs widget

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey aboutMeKey = GlobalKey(); // Add a GlobalKey for the AboutMe section
  int _currentLottieIndex = 0; // Index to track the current Lottie animation
  final List<String> _lottieAssets = [
    'assets/animations/developer.json', // Replace with your first Lottie animation
    'assets/animations/writer.json', // Replace with your second Lottie animation
    'assets/animations/research.json', // Replace with your third Lottie animation
  ];

  String _getLottieAsset() {
    return _lottieAssets[_currentLottieIndex];
  }

  void _cycleLottieAnimation() {
    setState(() {
      _currentLottieIndex = (_currentLottieIndex + 1) % _lottieAssets.length;
    });
  }

  @override
  void initState() {
    super.initState();
    Timer.periodic(Duration(seconds: 5), (timer) {
      _cycleLottieAnimation();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final ScrollController scrollController = ScrollController(); // Add a ScrollController
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 700;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(
          color: isDarkMode ? Colors.white : Colors.black, // Set icon color based on theme
        ),
        leading: Builder(
          builder: (context) => IconButton(
            icon: ImageIcon(
              AssetImage(
                isDarkMode 
                  ? 'assets/icons/icon_navbar-dark-bg.png' // Icon for dark mode
                  : 'assets/icons/icon_navbar-light-bg.png' // Icon for light mode
              ),
              size: 28, // Adjust size if needed
            ),
            onPressed: () => Scaffold.of(context).openDrawer(), // Open the drawer
          ),
        ),
      ),
      drawer: SidebarWidget(), // Sidebar Navigation
      body: SingleChildScrollView(
        controller: scrollController, // Attach the ScrollController
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section
            Container(
              height: isMobile ? null : MediaQuery.of(context).size.height * 0.9, // Full-Screen Hero
              width: double.infinity,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 16 : 30,
                vertical: isMobile ? 30 : 50,
              ), // Adjusted padding
              decoration: BoxDecoration(
                color: isDarkMode ? Colors.black : Colors.white,
              ),
              child: isMobile
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: 220,
                          child: Lottie.asset(
                            _getLottieAsset(),
                            key: ValueKey(_currentLottieIndex),
                            fit: BoxFit.contain,
                          ),
                        ),
                        SizedBox(height: 30),
                        Text(
                          'Hey, I am Rohan Batra',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: isDarkMode ? Colors.white : Colors.black,
                          ),
                          textAlign: TextAlign.center,
                        ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2), // Add fade and slide animation
                        SizedBox(height: 10), // Adjusted spacing
                        Text(
                          'Developer | Writer | Researcher',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                            color: isDarkMode ? Colors.grey[400] : Colors.grey[700],
                          ),
                          textAlign: TextAlign.center,
                        ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2), // Add fade and slide animation
                        SizedBox(height: 20), // Adjusted spacing
                        ElevatedButton(
                          onPressed: () {
                            // Smooth scroll to the AboutMe section
                            Scrollable.ensureVisible(
                              aboutMeKey.currentContext!,
                              duration: Duration(milliseconds: 500), // Smooth transition duration
                              curve: Curves.easeInOut, // Smooth transition curve
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDarkMode ? Colors.white : Colors.black,
                            foregroundColor: isDarkMode ? Colors.black : Colors.white,
                            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12), // Adjusted padding
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10), // Slightly rounded corners
                            ),
                          ),
                          child: Text(
                            'Explore More',
                            style: TextStyle(fontSize: 16), // Increased button text size
                          ),
                        ).animate().fadeIn(duration: 900.ms).slideY(begin: 0.2), // Add fade and slide animation
                      ],
                    )
                  : Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.spaceAround, // Adjust spacing
                      children: [
                        // Left Side: Text
                        Expanded(
                          flex: 6, // Increase space for text
                          child: Padding(
                            padding: EdgeInsets.only(
                              left: screenWidth > 1200 ? 50 : 20, // Add padding for large screens
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hey, I am Rohan Batra',
                                  style: TextStyle(
                                    fontSize: screenWidth > 1200
                                        ? 65 // Large screens
                                        : screenWidth > 800
                                            ? 55 // Medium screens
                                            : 45, // Small screens
                                    fontWeight: FontWeight.bold,
                                    color: isDarkMode ? Colors.white : Colors.black,
                                  ),
                                ).animate().fadeIn(duration: 500.ms).slideY(begin: 0.2), // Add fade and slide animation
                                SizedBox(height: 15), // Adjusted spacing
                                Text(
                                  'Developer | Writer | Researcher',
                                  style: TextStyle(
                                    fontSize: screenWidth > 1200
                                        ? 32 // Large screens
                                        : screenWidth > 800
                                            ? 28 // Medium screens
                                            : 24, // Small screens
                                    fontWeight: FontWeight.w500,
                                    color: isDarkMode ? Colors.grey[400] : Colors.grey[700],
                                  ),
                                ).animate().fadeIn(duration: 700.ms).slideY(begin: 0.2), // Add fade and slide animation
                                SizedBox(height: 30), // Adjusted spacing
                                ElevatedButton(
                                  onPressed: () {
                                    // Smooth scroll to the AboutMe section
                                    Scrollable.ensureVisible(
                                      aboutMeKey.currentContext!,
                                      duration: Duration(milliseconds: 500), // Smooth transition duration
                                      curve: Curves.easeInOut, // Smooth transition curve
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isDarkMode ? Colors.white : Colors.black,
                                    foregroundColor: isDarkMode ? Colors.black : Colors.white,
                                    padding: EdgeInsets.symmetric(horizontal: 25, vertical: 14), // Adjusted padding
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10), // Slightly rounded corners
                                    ),
                                  ),
                                  child: Text(
                                    'Explore More',
                                    style: TextStyle(fontSize: 18), // Increased button text size
                                  ),
                                ).animate().fadeIn(duration: 900.ms).slideY(begin: 0.2), // Add fade and slide animation
                              ],
                            ),
                          ),
                        ),
                        
                        // Right Side: Lottie Animation
                        Expanded(
                          flex: 4, // Reduce space for animation
                          child: LayoutBuilder(
                            builder: (context, constraints) {
                              final maxHeight = constraints.maxHeight * 0.9; // Slightly zoom in
                              return ConstrainedBox(
                                constraints: BoxConstraints(
                                  maxHeight: maxHeight,
                                  maxWidth: maxHeight, // Keep aspect ratio
                                ),
                                child: AnimatedSwitcher(
                                  duration: Duration(seconds: 1), // Duration for transition
                                  switchInCurve: Curves.easeIn, // Curve for entering animation
                                  switchOutCurve: Curves.easeOut, // Curve for exiting animation
                                  transitionBuilder: (Widget child, Animation<double> animation) {
                                    return FadeTransition(
                                      opacity: animation, // Apply fade transition
                                      child: child,
                                    );
                                  },
                                  child: Lottie.asset(
                                    _getLottieAsset(), // Get the current Lottie animation
                                    key: ValueKey(_currentLottieIndex), // Unique key for each animation
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
            ),

            // Content Section (Scrollable)
            Padding(
              key: aboutMeKey, // Assign the GlobalKey to the AboutMe section
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 12 : 50,
                vertical: isMobile ? 18 : 30,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  SizedBox(height: 24),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Expanded(
                        flex: 5,
                        child: SizedBox(
                          height: isMobile ? 140 : 180,
                          child: Lottie.asset(
                            'assets/animations/professional.json',
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      SizedBox(width: isMobile ? 20 : 60),
                      Expanded(
                        flex: 6,
                        child: AboutMe(isDarkMode: isDarkMode),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Add subtle separation
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 50),
              child: Divider(
                thickness: 1,
                color: isDarkMode ? Colors.grey[800] : Colors.grey[300], // Adjust color based on theme
              ),
            ),

            // Add uniform spacing
            SizedBox(height: 20),

            // Professional Experience Section
            ProfessionalExperience(isDarkMode: isDarkMode),

            // Add subtle separation
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 50),
              child: Divider(
                thickness: 1,
                color: isDarkMode ? Colors.grey[800] : Colors.grey[300], // Adjust color based on theme
              ),
            ),

            // Add uniform spacing
            SizedBox(height: 20),

            // Non-Profit Section
            NonProfit(isDarkMode: isDarkMode),

            // Add subtle separation
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 50),
              child: Divider(
                thickness: 1,
                color: isDarkMode ? Colors.grey[800] : Colors.grey[300], // Adjust color based on theme
              ),
            ),

            // Add uniform spacing
            SizedBox(height: 20),

            // Portfolio Section
            Portfolio(isDarkMode: isDarkMode),

            // Add subtle separation
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 50),
              child: Divider(
                thickness: 1,
                color: isDarkMode ? Colors.grey[800] : Colors.grey[300], // Adjust color based on theme
              ),
            ),

            // Add uniform spacing
            SizedBox(height: 20),

            // Contact Us Section   

            ContactUs(isDarkMode: isDarkMode),

            // Add uniform spacing

            // Add subtle separation
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 50),
              child: Divider(
                thickness: 1,
                color: isDarkMode ? Colors.grey[800] : Colors.grey[300], // Adjust color based on theme
              ),
            ),

            SizedBox(height: 20),
            // Download Section
            DownloadSection(isDarkMode: isDarkMode),

            // Footer Section
            Container(
              width: double.infinity,
              color: isDarkMode ? Colors.black : Colors.white,
              padding: EdgeInsets.symmetric(vertical: 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: 20),
                  Text(
                    '© 2025 Rohan Batra. All rights reserved.',
                    style: TextStyle(
                      color: isDarkMode ? Colors.grey[400] : Colors.grey[700],
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
