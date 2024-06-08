# SQLite to CSV Converter

This project is a simple web-based tool that allows you to convert SQLite database files to CSV format.

## Features

- Drag and drop file upload
- Progress bar to track the conversion process
- Notification system for updates and errors
- Converts multiple SQLite files at once

## Installation

No installation is required. Simply clone the repository and open `main.html` in your web browser.
```
git clone https://github.com/sahil0902/SQLitetoCSV.git
```
## Usage

1. Drag and drop your SQLite files into the drop zone or click on the drop zone to select files from your system.
2. Click the "Convert to CSV" button to start the conversion process.
3. The CSV files will be automatically downloaded once the conversion is complete.

## Dependencies

This project uses the following libraries:

- [sql.js](https://github.com/sql-js/sql.js) for handling SQLite files
- [Papa Parse](https://www.papaparse.com/) for generating CSV files
- [Notyf](https://github.com/caroso1222/notyf) for notifications

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.