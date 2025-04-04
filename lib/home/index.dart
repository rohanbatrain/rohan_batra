import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../sidebar.dart';
import 'about_me.dart'; // Import the AboutMe widget

class HomePage extends StatelessWidget {
  final GlobalKey aboutMeKey = GlobalKey(); // Add a GlobalKey for the AboutMe section

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final ScrollController scrollController = ScrollController(); // Add a ScrollController

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
              height: MediaQuery.of(context).size.height * 0.9, // Full-Screen Hero
              width: double.infinity,
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 40),
              decoration: BoxDecoration(
                color: isDarkMode ? Colors.black : Colors.white,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceAround, // Adjust spacing
                children: [
                  // Left Side: Text
                  Expanded(
                    flex: 6, // Increase space for text
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hey, I am Rohan Batra',
                          style: TextStyle(
                            fontSize: MediaQuery.of(context).size.width > 1200
                                ? 60 // Large screens
                                : MediaQuery.of(context).size.width > 800
                                    ? 50 // Medium screens
                                    : 40, // Small screens
                            fontWeight: FontWeight.bold,
                            color: isDarkMode ? Colors.white : Colors.black,
                          ),
                        ),
                        SizedBox(height: 10),
                        Text(
                          'Developer | Writer | Researcher',
                          style: TextStyle(
                            fontSize: MediaQuery.of(context).size.width > 1200
                                ? 30 // Large screens
                                : MediaQuery.of(context).size.width > 800
                                    ? 25 // Medium screens
                                    : 20, // Small screens
                            fontWeight: FontWeight.w500,
                            color: isDarkMode ? Colors.grey[400] : Colors.grey[700],
                          ),
                        ),
                        SizedBox(height: 20),
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
                            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text('Explore More'),
                        ),
                      ],
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
                          child: Lottie.asset(
                            'assets/panda.json', // Replace with your actual Lottie animation
                            fit: BoxFit.contain,
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
              padding: EdgeInsets.all(20),
              child: AboutMe(isDarkMode: isDarkMode), // Use the new AboutMe widget
            ),
          ],
        ),
      ),
    );
  }
}
