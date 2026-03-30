import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/models.dart';

class PdfReportService {
  // ── Driver Collection History ──────────────────────────────────────────────
  static Future<void> exportDriverHistory({
    required List<Collection> collections,
    required String period,
  }) async {
    final logo = await _loadLogo();
    final totalEarned = collections.fold<double>(0, (s, c) => s + c.earnings);
    final totalVol = collections.fold<double>(0, (s, c) => s + c.volume);

    final pdf = pw.Document();
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (ctx) => [
          _header(logo, 'Driver Collection Report', period),
          pw.SizedBox(height: 14),
          _summaryRow([
            _SI('Collections', '${collections.length}'),
            _SI('Total Volume', '${totalVol.toStringAsFixed(0)} kg'),
            _SI('Total Earnings', 'RWF ${_fmt(totalEarned)}'),
          ]),
          pw.SizedBox(height: 18),
          pw.Text('Collection Details',
              style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 13)),
          pw.SizedBox(height: 8),
          pw.TableHelper.fromTextArray(
            border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
            headerStyle: pw.TextStyle(
                fontWeight: pw.FontWeight.bold, color: PdfColors.white),
            headerDecoration:
                pw.BoxDecoration(color: PdfColor.fromInt(0xFF1565C0)),
            cellAlignment: pw.Alignment.centerLeft,
            cellPadding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            headers: ['Business', 'Date', 'Waste Type', 'Volume', 'Earnings'],
            data: collections
                .map((c) => [
                      c.businessName,
                      '${c.scheduledDate.day}/${c.scheduledDate.month}/${c.scheduledDate.year}',
                      c.wasteType.label,
                      '${c.volume.toStringAsFixed(0)} kg',
                      'RWF ${c.earnings.toStringAsFixed(0)}',
                    ])
                .toList(),
          ),
          pw.SizedBox(height: 16),
          _footer(),
        ],
      ),
    );

    await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'ecotrade-driver-history-$period.pdf');
  }

  // ── Driver Earnings ────────────────────────────────────────────────────────
  static Future<void> exportDriverEarnings({
    required List<Transaction> transactions,
    required String period,
    required double totalEarnings,
  }) async {
    final logo = await _loadLogo();
    final periodEarned = transactions.fold<double>(0, (s, t) => s + t.amount);

    final pdf = pw.Document();
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (ctx) => [
          _header(logo, 'Driver Earnings Report', period),
          pw.SizedBox(height: 14),
          _summaryRow([
            _SI('Transactions', '${transactions.length}'),
            _SI('Period Earnings', 'RWF ${_fmt(periodEarned)}'),
            _SI('All-time Total', 'RWF ${_fmt(totalEarnings)}'),
          ]),
          pw.SizedBox(height: 18),
          pw.Text('Transaction Details',
              style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 13)),
          pw.SizedBox(height: 8),
          pw.TableHelper.fromTextArray(
            border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
            headerStyle: pw.TextStyle(
                fontWeight: pw.FontWeight.bold, color: PdfColors.white),
            headerDecoration:
                pw.BoxDecoration(color: PdfColor.fromInt(0xFF1565C0)),
            cellAlignment: pw.Alignment.centerLeft,
            cellPadding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            headers: ['From', 'Waste Type', 'Volume', 'Amount', 'Date'],
            data: transactions
                .map((t) => [
                      t.from,
                      t.wasteType.label,
                      '${t.volume.toStringAsFixed(0)} kg',
                      'RWF ${t.amount.toStringAsFixed(0)}',
                      '${t.date.day}/${t.date.month}/${t.date.year}',
                    ])
                .toList(),
          ),
          pw.SizedBox(height: 16),
          _footer(),
        ],
      ),
    );

    await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'ecotrade-earnings-$period.pdf');
  }

  // ── Shared layout helpers ──────────────────────────────────────────────────
  static pw.Widget _header(
      pw.ImageProvider? logo, String title, String period) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          crossAxisAlignment: pw.CrossAxisAlignment.center,
          children: [
            if (logo != null)
              pw.Image(logo, width: 80)
            else
              pw.Text('EcoTrade Rwanda',
                  style: pw.TextStyle(
                      fontSize: 16,
                      fontWeight: pw.FontWeight.bold,
                      color: PdfColors.blue800)),
            pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.end,
              children: [
                pw.Text(title,
                    style: pw.TextStyle(
                        fontSize: 15, fontWeight: pw.FontWeight.bold)),
                pw.Text('Period: $period',
                    style: const pw.TextStyle(
                        fontSize: 10, color: PdfColors.grey700)),
                pw.Text(
                    'Generated: ${DateTime.now().toString().substring(0, 10)}',
                    style: const pw.TextStyle(
                        fontSize: 10, color: PdfColors.grey500)),
              ],
            ),
          ],
        ),
        pw.SizedBox(height: 6),
        pw.Divider(
            color: PdfColor.fromInt(0xFF1565C0), thickness: 1.5),
      ],
    );
  }

  static pw.Widget _summaryRow(List<_SI> items) {
    return pw.Row(
      children: items
          .map((item) => pw.Expanded(
                child: pw.Container(
                  margin: const pw.EdgeInsets.only(right: 8),
                  padding: const pw.EdgeInsets.all(10),
                  decoration: pw.BoxDecoration(
                    border: pw.Border.all(
                        color: PdfColor.fromInt(0xFFBBDEFB), width: 0.5),
                    borderRadius:
                        const pw.BorderRadius.all(pw.Radius.circular(6)),
                    color: PdfColor.fromInt(0xFFE3F2FD),
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(item.value,
                          style: pw.TextStyle(
                              fontSize: 13,
                              fontWeight: pw.FontWeight.bold,
                              color: PdfColors.blue900)),
                      pw.Text(item.label,
                          style: const pw.TextStyle(
                              fontSize: 9, color: PdfColors.grey700)),
                    ],
                  ),
                ),
              ))
          .toList(),
    );
  }

  static pw.Widget _footer() {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Divider(color: PdfColors.grey300),
        pw.Text(
          'EcoTrade Rwanda — Circular Economy Waste Marketplace, Kigali',
          style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500),
          textAlign: pw.TextAlign.center,
        ),
      ],
    );
  }

  static Future<pw.ImageProvider?> _loadLogo() async {
    try {
      final data = await rootBundle.load('assets/images/EcoTrade.png');
      return pw.MemoryImage(data.buffer.asUint8List());
    } catch (_) {
      return null;
    }
  }

  static String _fmt(double n) => n
      .toStringAsFixed(0)
      .replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');
}

class _SI {
  final String label;
  final String value;
  const _SI(this.label, this.value);
}
