return Scaffold(
  backgroundColor: context.cBg,
  appBar: PreferredSize(
    preferredSize: const Size.fromHeight(60),
    child: AppBar(
      title: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16),
        child: Text('Business Dashboard'),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ),
      ],
    ),
  ),
  body: Center(
    child: Text('Hello, World!'),
  ),
);