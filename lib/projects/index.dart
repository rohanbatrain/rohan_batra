import 'package:flutter/material.dart';

class ProjectsIndexPage extends StatelessWidget {
  final List<Map<String, String>> companies = [
    {
      'role': 'Software Engineer',
      'name': 'Company A',
      'logo': 'assets/images/company_a.png',
      'employmentType': 'Full-Time',
      'startDate': 'Jan 2020',
      'endDate': 'Dec 2021',
    },
    {
      'role': 'Frontend Developer',
      'name': 'Company B',
      'logo': 'assets/images/company_b.png',
      'employmentType': 'Contract',
      'startDate': 'Feb 2019',
      'endDate': 'Jan 2020',
    },
    {
      'role': 'Backend Developer',
      'name': 'Company C',
      'logo': 'assets/images/company_c.png',
      'employmentType': 'Part-Time',
      'startDate': 'Mar 2018',
      'endDate': 'Feb 2019',
    },
    {
      'role': 'Tech Lead',
      'name': 'Company D',
      'logo': 'assets/images/company_d.png',
      'employmentType': 'Full-Time',
      'startDate': 'Apr 2021',
      'endDate': 'Currently Working',
    },
    {
      'role': 'UI/UX Designer',
      'name': 'Company E',
      'logo': 'assets/images/company_e.png',
      'employmentType': 'Freelance',
      'startDate': 'May 2020',
      'endDate': 'Aug 2020',
    },
    {
      'role': 'Project Manager',
      'name': 'Company F',
      'logo': 'assets/images/company_f.png',
      'employmentType': 'Full-Time',
      'startDate': 'Sep 2019',
      'endDate': 'Dec 2020',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Projects'),
        leading: IconButton(
          icon: ImageIcon(
            AssetImage(
              Theme.of(context).brightness == Brightness.dark
                  ? 'assets/icons/icon_back-arrow-dark-bg.png' // Dark mode icon
                  : 'assets/icons/icon_back-arrow-light-bg.png' // Light mode icon
            ),
          ),
          onPressed: () {
            Navigator.pop(context); // Navigate back
          },
        ),
        iconTheme: IconThemeData(
          color: Theme.of(context).iconTheme.color, // Ensure proper contrast
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'My Professional Journey',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: 16),
            Text(
              'Here are some of the amazing companies I have collaborated with:',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: companies.length,
                itemBuilder: (context, index) {
                  final company = companies[index];
                  return AnimatedTile(company: company);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AnimatedTile extends StatefulWidget {
  final Map<String, String> company;

  const AnimatedTile({Key? key, required this.company}) : super(key: key);

  @override
  _AnimatedTileState createState() => _AnimatedTileState();
}

class _AnimatedTileState extends State<AnimatedTile> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() {
          _scale = 0.95; // Shrink slightly on tap
        });
      },
      onTapUp: (_) {
        setState(() {
          _scale = 1.0; // Return to normal size
        });
      },
      onTapCancel: () {
        setState(() {
          _scale = 1.0; // Reset if tap is canceled
        });
      },
      child: AnimatedScale(
        scale: _scale,
        duration: Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  widget.company['logo']!,
                  height: 50,
                  fit: BoxFit.cover,
                ),
                SizedBox(height: 8),
                Text(
                  widget.company['name']!,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                SizedBox(height: 4),
                Text(
                  widget.company['role']!,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                SizedBox(height: 4),
                Text(
                  widget.company['employmentType']!,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                SizedBox(height: 4),
                Text(
                  '${widget.company['startDate']} - ${widget.company['endDate']}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
