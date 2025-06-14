import 'package:flutter/material.dart';
import 'package:rohanbatra/skillwise-portfolio/portfolio/main_portfolio_screen.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PortfolioTile extends StatelessWidget {
  final String portfolio;

  const PortfolioTile({required this.portfolio, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).brightness == Brightness.dark
        ? Colors.white
        : Colors.black;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 6,
      margin: EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: ListTile(
          onTap: () {
            if (portfolio == 'Portfolio') {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => MainPortfolioScreen()),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Portfolio not recognized: $portfolio')),
              );
            }
          },
          leading: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                FontAwesomeIcons.briefcase,
                color: Theme.of(context).brightness == Brightness.dark
                    ? Colors.white
                    : Colors.black,
                size: 32,
              ),
              SizedBox(width: 8),
            ],
          ),
          title: Text(
            portfolio,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
          ),
          subtitle: Text(
            'Showcase your projects and achievements.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: textColor),
          ),
        ),
      ),
    );
  }
}
