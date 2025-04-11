import 'dart:async';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class SecondBrainTools2022Screen extends StatefulWidget {
  const SecondBrainTools2022Screen({super.key});

  @override
  State<SecondBrainTools2022Screen> createState() => _SecondBrainTools2022ScreenState();
}

class _SecondBrainTools2022ScreenState extends State<SecondBrainTools2022Screen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late Timer _timer;

  final int _bannerCount = 2;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (Timer timer) {
      if (_currentPage < _bannerCount - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Widget _buildBannerCarousel(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final banners = [
      // ⚠️ EOL Banner
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.redAccent),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '⚠️ NOTICE: PROJECT NO LONGER MAINTAINED',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.redAccent),
            ),
            SizedBox(height: 8),
            Text(
              'This project has been flagged End of Life (EOL) since December 2022, but remains available for reference and legacy use.',
            ),
          ],
        ),
      ),

      // Light/Dark Mode Banner Image
      ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.asset(
          isDark
              ? 'assets/images/banners/Second-Brain-Tools-2022/Dark-Mode/2.png'
              : 'assets/images/banners/Second-Brain-Tools-2022/Light-Mode/1.png',
          fit: BoxFit.cover,
        ),
      ),
    ];

    return SizedBox(
      height: 200,
      child: PageView.builder(
        controller: _pageController,
        itemCount: banners.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: banners[index],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Second Brain Tools 2022'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBannerCarousel(context),
            const SizedBox(height: 24),

            const Text(
              'Second Brain Tools 2022',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            // Badges (removed SVG, using text instead for simplicity)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: const [
                Chip(label: Text('PyLint Status')),
                Chip(label: Text('Build Status')),
                Chip(label: Text('MkDocs Status')),
                Chip(label: Text('Coverage')),
                Chip(label: Text('PyPI v0.0.4')),
                Chip(label: Text('Wheel Support')),
                Chip(label: Text('Python Versions')),
                Chip(label: Text('Implementation')),
              ],
            ),
            const SizedBox(height: 24),

            const Text('🧠 Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Second Brain Tools 2022 is a Python-based CLI toolkit for creating, organizing, and managing notes using the Second Brain Vault.',
            ),
            const SizedBox(height: 24),

            const Text('📦 Installation', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SelectableText('pip install second-brain-tools'),
            const SizedBox(height: 6),
            SelectableText('pip install https://github.com/rohanbatrain/Second-Brain-Tools/archive/main.zip'),
            const SizedBox(height: 24),

            const Text('💻 Usage', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SelectableText('from second_brain_tools import cli\ncli.main()'),
            const SizedBox(height: 24),

            const Text('📚 Documentation', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SelectableText('https://rohanbatrain.github.io/second-brain-tools-2022/'),
            const SizedBox(height: 24),

            const Text('🧪 Development', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('To run all tests using tox:'),
            const SizedBox(height: 6),
            SelectableText('tox'),
            const SizedBox(height: 12),
            const Text('To combine coverage on Windows:'),
            SelectableText('set PYTEST_ADDOPTS=--cov-append\ntox'),
            const SizedBox(height: 12),
            const Text('To combine coverage on Unix/macOS:'),
            SelectableText('PYTEST_ADDOPTS=--cov-append tox'),
            const SizedBox(height: 24),

            const Text('📄 License', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Apache Software License 2.0'),
          ],
        ),
      ),
    );
  }
}
