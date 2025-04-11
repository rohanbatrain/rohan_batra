import 'package:flutter/material.dart';

class PortfolioScreen extends StatelessWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Portfolio & Resume'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🖼️ Banner
            Padding(
              padding: const EdgeInsets.all(20),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxHeight: 200,
                  ),
                  child: Image.asset(
                    isDarkMode
                        ? 'assets/images/banners/Portfolio/Dark-Mode/2.png'
                        : 'assets/images/banners/Portfolio/Light-Mode/1.png',
                    width: double.infinity,
                    fit: BoxFit.fitWidth,
                  ),
                ),
              ),
            ),

            // 📝 Content
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '📄 Portfolio & Resume',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 16),

                  Text(
                    'This repository contains my professional resume and a GitHub Action workflow to compile and release it as a LaTeX-generated PDF.',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 24),

                  Text(
                    '📁 Structure:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 12),
                  Text('• `resume/` - LaTeX source files'),
                  Text('• GitHub Action compiles and publishes PDF to Releases'),

                  SizedBox(height: 24),
                  Text(
                    '🚀 Usage:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('1. Clone the repository'),
                  Text('2. Navigate to `resume/` directory'),
                  Text('3. Edit LaTeX files as needed'),
                  Text('4. GitHub Action compiles and releases updated resume automatically'),

                  SizedBox(height: 24),
                  Text(
                    '🛠️ Future Plans:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Add more portfolio projects and showcase items'),

                  SizedBox(height: 24),
                  Text(
                    '🤝 Contributing:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Open issues or submit pull requests for suggestions and improvements'),

                  SizedBox(height: 24),
                  Text(
                    '📬 License:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  SizedBox(height: 8),
                  Text('• Personal & educational use only. Contact for commercial use.'),

                  SizedBox(height: 40),
                  Center(
                    child: Text(
                      'Reach out via GitHub for any queries or suggestions.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                  SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
