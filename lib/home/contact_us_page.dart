import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lottie/lottie.dart';

class ContactUsPage extends StatefulWidget {
  @override
  _ContactUsPageState createState() => _ContactUsPageState();
}

class _ContactUsPageState extends State<ContactUsPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  bool _isSending = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _launchUrl(Uri uri) async {
    setState(() => _isSending = true);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Email client opened!'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open email client. No supported email client was found.'), backgroundColor: Colors.red),
        );
        print('Could not launch: ' + uri.toString());
      }
    } catch (e) {
      print('Launch error: ' + e.toString());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ' + e.toString()), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isSending = false);
    }
  }

  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      FocusScope.of(context).unfocus();
      final name = _nameController.text.trim();
      final email = _emailController.text.trim();
      final message = _messageController.text.trim();
      final mailtoUri = Uri(
        scheme: 'mailto',
        path: 'contact@rohanbatra.in', // Change to your email
        query: 'subject=Contact from $name&body=Name: $name\nEmail: $email\n\n$message',
      );
      _launchUrl(mailtoUri);
      _formKey.currentState!.reset();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isWide = MediaQuery.of(context).size.width > 700;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(FontAwesomeIcons.arrowLeft),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('Contact Us'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 900),
            child: isWide
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Lottie.network(
                            'https://lottie.host/4aaccb60-6bd0-418d-85d0-b21940605a14/gBuOxKdbdC.json',
                            height: 340,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      SizedBox(width: 32),
                      Expanded(
                        child: _ContactForm(
                          formKey: _formKey,
                          nameController: _nameController,
                          emailController: _emailController,
                          messageController: _messageController,
                          isSending: _isSending,
                          isDark: isDark,
                          onSubmit: _isSending ? null : _submitForm,
                        ),
                      ),
                    ],
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Lottie.network(
                        'https://lottie.host/4aaccb60-6bd0-418d-85d0-b21940605a14/gBuOxKdbdC.json',
                        height: 180,
                        fit: BoxFit.contain,
                      ),
                      SizedBox(height: 24),
                      _ContactForm(
                        formKey: _formKey,
                        nameController: _nameController,
                        emailController: _emailController,
                        messageController: _messageController,
                        isSending: _isSending,
                        isDark: isDark,
                        onSubmit: _isSending ? null : _submitForm,
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

// Minimal, professional contact form widget
class _ContactForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController messageController;
  final bool isSending;
  final bool isDark;
  final VoidCallback? onSubmit;

  const _ContactForm({
    required this.formKey,
    required this.nameController,
    required this.emailController,
    required this.messageController,
    required this.isSending,
    required this.isDark,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: isDark ? Colors.grey[900] : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Get in Touch',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
              SizedBox(height: 24),
              TextFormField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Please enter your name' : null,
              ),
              SizedBox(height: 20),
              TextFormField(
                controller: emailController,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Please enter your email';
                  if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+').hasMatch(value)) return 'Enter a valid email';
                  return null;
                },
              ),
              SizedBox(height: 20),
              TextFormField(
                controller: messageController,
                decoration: InputDecoration(
                  labelText: 'Message',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  floatingLabelBehavior: FloatingLabelBehavior.always,
                  contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                ),
                maxLines: 5,
                validator: (value) => value == null || value.isEmpty ? 'Please enter your message' : null,
              ),
              SizedBox(height: 32),
              ElevatedButton(
                onPressed: onSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? Colors.white : Colors.black,
                  foregroundColor: isDark ? Colors.black : Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 18),
                  textStyle: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: isSending
                    ? SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text('Send'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
