// ignore_for_file: library_private_types_in_public_api

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:nfc_manager/nfc_manager.dart';
import 'package:barcode_scan2/barcode_scan2.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomePage(),        
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _qrCodeResult = '';
  String _tagScanned = '';

  // send data to api
  Future<void> sendData() async {
    final response = await http.post(
      Uri.parse('http://localhost:3000/api/users/verification/code'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'sessionToken': _qrCodeResult,
        'token': _tagScanned
      }),
    );

    if (response.statusCode == 201) {
      // Si la requête a réussi, décodez le JSON
      Map<String, dynamic> data = jsonDecode(response.body);
      print('Request result');
      print(data);
    } else {
      // Si la requête a échoué, lancez une exception
      print('Request failed');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NFC Reader App'),
      ),
      body:  Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Scanner un QR Code',
              style: TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
            Text(
              '$_qrCodeResult'
            ),
            Icon(Icons.arrow_circle_down_outlined),
            Text(
              'Scanner votre tag NFC',
              style: TextStyle(fontSize: 12),
              textAlign: TextAlign.center,
            ),
            Text(
              '$_tagScanned'
            ),
          ],
        )),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {

          // lire le qr code 

          var qrResult = await BarcodeScanner.scan();

          if(qrResult.rawContent.isNotEmpty) {
            setState(() {
              _qrCodeResult = qrResult.rawContent;
            });

            print('\n\n Qr Code : \n');
            print(_qrCodeResult);
          }

          // lire la carte nfc avec le modal

          String result = await showModalBottomSheet(
            context: context, 
            builder: (BuildContext context) {
              return NFCBottomSheet();
            }
          );

          if(result != null) {

            print('Value scanner : \n');
            print(result.toString());
            print(result.startsWith('ey'));

            if (result.startsWith('en')) {
              result = result.substring(2); // Supprimer les deux premiers caractères (en)
            }

            setState(() {
              _tagScanned = result;
            });

            sendData();

          }

        },
        child: const Icon(Icons.nfc),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }
}


class NFCBottomSheet extends StatefulWidget {
  @override
  State<NFCBottomSheet> createState() => _NFCBottomSheetState();
}


class _NFCBottomSheetState extends State<NFCBottomSheet> {

  String _nfcData = '';

  @override void initState() {
    super.initState();
    _startNfc();
  }

  void _startNfc() {
    NfcManager.instance.startSession(
      onDiscovered: (NfcTag tag) async {

        var ndef = Ndef.from(tag);
        if(ndef == null) {
          setState(() {
            _nfcData = 'No NDef data found';
          });
          return;
        }

        // Read the NDEF message
        NdefMessage? message = await ndef.read();
        if(message == null){
          setState(() {
            _nfcData = 'Failed to read NDEF message';
          });
          return;
        }

        String payload = message.records.map((record) => String.fromCharCodes(record.payload)).join(', ');

        setState(() {
          _nfcData = payload;
        });

        // stop nfc session
        NfcManager.instance.stopSession();
        Navigator.pop(context, _nfcData);
      }
    );
      
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: const Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            'En attente du scan d\'une balise NFC...',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}