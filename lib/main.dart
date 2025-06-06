import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import SharedPreferences
import 'dart:async';
import 'home/index.dart';
import 'package:flutter/services.dart'; // Import for rootBundle
import 'dart:math'; // For random selection

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Ensure bindings are initialized
  final prefs = await SharedPreferences.getInstance();
  final isDarkMode = prefs.getBool('isDarkMode') ?? false;
  themeNotifier.value = isDarkMode ? ThemeMode.dark : ThemeMode.light; // Load theme preference
  runApp(PortfolioApp());
}

final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

// Map animations to their quotes
final Map<String, List<String>> animationQuotes = {
  'assets/animations/panda.json': [
    'Stay curious, keep learning!',
    'Pandas are proof that you can be cute and productive.',
    'Embrace the journey, not just the destination.',
    'Loading my portfolio... please wait!',
    'My portfolio is almost ready!',
    'Gathering my experience, one paw at a time.'
  ],
  // Add more animation-quote pairs as needed
  'assets/animations/5b6C8UQeUj.json': [
    'Fetching fun, just a moment!',
    'Playing fetch with pixels, almost there!',
    'Sit, stay, and enjoy the show... almost ready!',
    'Our best friends are preparing my portfolio!',
    'Unleashing creativity, one bark at a time!',
    'Loading my portfolio, wagging our tails!',
    'My portfolio is on its way!'
  ],
  'assets/animations/IceAcvKhR4.json': [
    "Get ready to jump for joy - my portfolio's almost here!",
    "Leaping into new adventures, just a moment!",
    "We're thrilled to show you what's next!",
    'Loading my portfolio, get ready to leap!',
    'Excitement is building... my portfolio is loading!'
  ],
  'assets/animations/iNi4lrRvEq.json': [
    "Boo! my portfolio is almost here!",
    "Don't be scared, just loading my portfolio...",
    "A ghostly 'boo' while we fetch my portfolio!",
    "Spooking up my portfolio, please wait...",
    "Peek-a-boo! Portfolio coming soon!",
    "Even ghosts need to load portfolios!"
  ],
};

class PortfolioApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, ThemeMode currentTheme, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Rohan Batra Portfolio', // Add title for SEO
          theme: ThemeData.light().copyWith(
            appBarTheme: AppBarTheme(
              iconTheme: IconThemeData(), // Removed incorrect 'icon' parameter
            ),
          ),
          darkTheme: ThemeData.dark().copyWith(
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

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late Timer _timer;
  bool _assetsPrefetched = false; // Track if assets are prefetched
  late final AnimationController _lottieController;
  late String _selectedAnimation;
  late String _selectedQuote;
  int _splashDuration = 3; // Default duration

  @override
  void initState() {
    super.initState();
    _lottieController = AnimationController(vsync: this);
    _selectRandomAnimationAndQuote();
    _loadSplashDuration();
  }

  Future<void> _loadSplashDuration() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _splashDuration = prefs.getInt('splashDuration') ?? 3;
    });
  }

  void _selectRandomAnimationAndQuote() {
    final keys = animationQuotes.keys.toList();
    final random = Random();
    _selectedAnimation = keys[random.nextInt(keys.length)];
    final quotes = animationQuotes[_selectedAnimation]!;
    _selectedQuote = quotes[random.nextInt(quotes.length)];
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
      ...animationQuotes.keys.where((k) => k.startsWith('assets/animations/')),
      // Add more Lottie assets here
    ];
    for (var asset in lottieAssets) {
      await rootBundle.load(asset);
    }
  }

  void _startTimer() {
    _timer = Timer(Duration(seconds: _splashDuration), () {
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
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final screenSize = MediaQuery.of(context).size;
            final isMobile = screenSize.width < 700;
            final animationSize = isMobile
                ? screenSize.width * 0.7
                : screenSize.width < 1200
                    ? 300.0
                    : 400.0;
            final quoteFontSize = isMobile
                ? screenSize.width * 0.045
                : screenSize.width < 1200
                    ? 24.0
                    : 28.0;
            final enjoyFontSize = isMobile
                ? screenSize.width * 0.03
                : screenSize.width < 1200
                    ? 14.0
                    : 16.0;
            final verticalSpacing = isMobile
                ? screenSize.height * 0.02
                : screenSize.height * 0.03;
            return SizedBox(
              width: double.infinity,
              height: double.infinity,
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: 500,
                    minWidth: 200,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Semantics(
                        label: 'Loading animation', // Add alt text for animation
                        child: SizedBox(
                          width: animationSize,
                          height: animationSize,
                          child: _selectedAnimation.startsWith('http')
                              ? Lottie.network(
                                  _selectedAnimation,
                                  controller: _lottieController,
                                  onLoaded: (composition) {
                                    _lottieController.duration = composition.duration;
                                    _lottieController.repeat();
                                  },
                                  fit: BoxFit.cover,
                                )
                              : Lottie.asset(
                                  _selectedAnimation,
                                  controller: _lottieController,
                                  onLoaded: (composition) {
                                    _lottieController.duration = composition.duration;
                                    _lottieController.repeat();
                                  },
                                  fit: BoxFit.cover,
                                ),
                        ),
                      ),
                      SizedBox(height: verticalSpacing),
                      Semantics(
                        label: 'Quote: $_selectedQuote', // Add semantic label for quote
                        child: AnimatedText(text: _selectedQuote, fontSize: quoteFontSize),
                      ),
                      SizedBox(height: verticalSpacing),
                      Text(
                        'Enjoy the animation!',
                        style: TextStyle(
                          fontSize: enjoyFontSize,
                          fontStyle: FontStyle.italic,
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timer.cancel();
    _lottieController.dispose();
    super.dispose();
  }
}

class AnimatedText extends StatefulWidget {
  final String text;
  final double fontSize;
  AnimatedText({required this.text, this.fontSize = 24});
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
        widget.text,
        style: TextStyle(
          fontSize: widget.fontSize, // Responsive font size
          fontWeight: FontWeight.w600,
          color: Theme.of(context).textTheme.bodyLarge?.color,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
