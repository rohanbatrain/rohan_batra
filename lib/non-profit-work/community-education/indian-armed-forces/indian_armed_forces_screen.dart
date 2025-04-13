import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class IndianArmedForcesScreen extends StatelessWidget {
  const IndianArmedForcesScreen({super.key});

  final List<Map<String, String>> certificates = const [
    {
      'title': 'Golden Key Eagles Women Empowerment Center',
      'date': 'Sep 2024',
      'image': 'assets/images/certificates/IAF/3.jpg',
      'description':
          'Delivered cybersecurity awareness sessions for women, promoting safe digital habits and online confidence.',
    },
    {
      'title': 'HQ Uttrakhand Sub Area',
      'date': 'Aug 2024',
      'image': 'assets/images/certificates/IAF/2.jpg',
      'description':
          'Engaged with army families to provide cyber hygiene education, highlighting inclusive tech practices.',
    },
    {
      'title': 'Golden Key Tuskers (AWWA Week 2024)',
      'date': 'Aug 2024',
      'image': 'assets/images/certificates/IAF/1.jpg',
      'description':
          'Participated in Army Welfare Week by offering digital safety workshops to strengthen cyber resilience.',
    },
  ];

  void showCertificateDialog(BuildContext context, String imagePath) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Certificate Preview',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 16),
              Image.asset(
                imagePath,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => SizedBox(
                  height: 150,
                  child: Center(
                    child: FaIcon(
                      FontAwesomeIcons.shieldHalved,
                      size: 48,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Indian Armed Forces'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.arrowLeft),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            // Introductory Section with Enhanced Styling
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: theme.colorScheme.primary.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Empowering Indian Armed Forces Families',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'I personally organized these initiatives to support and empower Indian Armed Forces families through digital education and cybersecurity awareness.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontStyle: FontStyle.italic,
                      color: theme.colorScheme.secondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.justify,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Certificate Header
            Text(
              'Certificates Awarded:',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const Divider(color: Colors.grey),
            const SizedBox(height: 16),

            // List of Certificates
            Expanded(
              child: ListView.separated(
                itemCount: certificates.length,
                separatorBuilder: (_, __) => const SizedBox(height: 24),
                itemBuilder: (context, index) {
                  final cert = certificates[index];
                  return GestureDetector(
                    onTap: () =>
                        showCertificateDialog(context, cert['image']!),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left image container
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade400),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              cert['image']!,
                              fit: BoxFit.cover,
                              errorBuilder:
                                  (context, error, stackTrace) => Center(
                                child: FaIcon(
                                  FontAwesomeIcons.shieldHalved,
                                  size: 32,
                                  color: theme.colorScheme.primary,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        // Right content
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                cert['title']!,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                cert['date']!,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.hintColor,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                cert['description']!,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.justify,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
