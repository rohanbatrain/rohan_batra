import 'package:flutter/material.dart';

class GitHubActionsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('GitHub Actions'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner widget
            SizedBox(
              height: 200,
              width: double.infinity,
              child: Image.asset(
                isDarkMode
                    ? 'assets/images/banners/Github-Actions/2.png'
                    : 'assets/images/banners/Github-Actions/1.png',
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 24),

            // Details Section
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Details about GitHub Actions',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'GitHub Actions is a powerful CI/CD tool that allows developers to automate workflows directly from their repositories. '
                'It supports a wide range of integrations and enables seamless automation of build, test, and deployment processes.',
                style: TextStyle(fontSize: 18),
              ),
            ),
            const SizedBox(height: 24),

            // Categories Section
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'Categories of My Usage',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'This section highlights the various ways I use GitHub Actions in my projects. '
                'These include automating tasks such as module releases, builds, deployments, and more.',
                style: TextStyle(fontSize: 16),
              ),
            ),
            const SizedBox(height: 16),
            ListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              children: const [
                _CategoryTile(title: 'Python Module Release'),
                SizedBox(height: 8),
                _CategoryTile(title: 'Docker Builds'),
                SizedBox(height: 8),
                _CategoryTile(title: 'Website Build and Release'),
                SizedBox(height: 8),
                _CategoryTile(title: 'Flutter Multi-Platform Builds and Release'),
                SizedBox(height: 8),
                _CategoryTile(title: 'Code Linting and Quality'),
                SizedBox(height: 8),
                _CategoryTile(title: 'Other Fun Projects'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  final String title;

  const _CategoryTile({required this.title});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
