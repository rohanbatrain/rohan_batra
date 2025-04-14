import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import SharedPreferences
import 'dart:async';
import 'home/index.dart';
import 'package:flutter/services.dart'; // Import for rootBundle

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Ensure bindings are initialized
  final prefs = await SharedPreferences.getInstance();
  final isDarkMode = prefs.getBool('isDarkMode') ?? false;
  themeNotifier.value = isDarkMode ? ThemeMode.dark : ThemeMode.light; // Load theme preference
  runApp(PortfolioApp());
}

final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

class PortfolioApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, ThemeMode currentTheme, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData.light().copyWith(
            appBarTheme: AppBarTheme(
              iconTheme: IconThemeData(), // Removed incorrect 'icon' parameter
            ),
          ),
          darkTheme: ThemeData.dark().copyWith(
            scaffoldBackgroundColor: Colors.grey[900], // Match other screens in dark mode
            appBarTheme: AppBarTheme(
              iconTheme: IconThemeData(), // Removed incorrect 'icon' parameter
            ),
          ),
          themeMode: currentTheme,
          home: SplashScreen(),
        );
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  late Timer _timer;
  bool _isPaused = false;
  bool _assetsPrefetched = false; // Track if assets are prefetched

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_assetsPrefetched) {
      _prefetchAssets().then((_) {
        setState(() {
          _assetsPrefetched = true;
        });
        _startTimer();
      });
    }
  }

  Future<void> _prefetchAssets() async {
    // Prefetch images
    final imageAssets = [
      'assets/icons/icon_back-arrow-dark-bg.png',
      'assets/icons/icon_back-arrow-light-bg.png',
      'assets/icons/icon_navbar-dark-bg.png',
      'assets/icons/icon_navbar-light-bg.png',
      'assets/logos/Rohan-Batra/logo.png',
      'assets/logos/UPES/UPES1.png',
      'assets/logos/UPES/UPES2.png',
      'assets/logos/SMCS/building.jpg',
      // Add more image assets here
    ];
    for (var asset in imageAssets) {
      await precacheImage(AssetImage(asset), context);
    }

    // Prefetch Lottie animations
    final lottieAssets = [
      'assets/animations/panda.json',
      'assets/animations/developer.json',
      'assets/animations/writer.json',
      'assets/animations/research.json',
      'assets/animations/professional.json',
      'assets/animations/experience.json',
      'assets/animations/portfolio.json',
      'assets/animations/non-profit.json',
      'assets/animations/download.json',
      // Add more Lottie assets here
    ];
    for (var asset in lottieAssets) {
      await rootBundle.load(asset);
    }
  }

  void _startTimer() {
    _timer = Timer(Duration(seconds: 3), () {
      if (!_isPaused) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => HomePage(),
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
      }
    });
  }

  void _pauseTimer() {
    _timer.cancel();
    setState(() {
      _isPaused = true;
    });
  }

  void _resumeTimer() {
    setState(() {
      _isPaused = false;
    });
    _startTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            MouseRegion(
              onEnter: (_) => _pauseTimer(), // Pause on hover
              onExit: (_) => _resumeTimer(), // Resume on hover exit
              child: GestureDetector(
                onTapDown: (_) => _pauseTimer(), // Pause on hold
                onTapUp: (_) => _resumeTimer(), // Resume on release
                child: Lottie.asset(
                  'assets/animations/panda.json',
                  width: 300, // Reduced width
                  height: 300, // Reduced height
                  fit: BoxFit.cover,
                ),
              ),
            ),
            SizedBox(height: 20), // Add spacing between animation and text
            AnimatedText(),
            SizedBox(height: 40), // Add spacing before the note
            Text(
              'Hover or hold to admire "Dumbo" as he eats.',
              style: TextStyle(
                fontSize: 14,
                fontStyle: FontStyle.italic,
                color: Theme.of(context).textTheme.bodySmall?.color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }
}

class AnimatedText extends StatefulWidget {
  @override
  _AnimatedTextState createState() => _AnimatedTextState();
}

class _AnimatedTextState extends State<AnimatedText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);

    _opacity = Tween<double>(begin: 0.5, end: 1.0).animate(_controller);
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: Text(
        'Loading...',
        style: TextStyle(
          fontSize: 24, // Increased font size
          fontWeight: FontWeight.w600, // Slightly bolder weight
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
