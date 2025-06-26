// pubspec.yaml
/*
name: location_tracker
description: App para rastreamento de localização em background

dependencies:
  flutter:
    sdk: flutter
  geolocator: ^10.1.0
  permission_handler: ^11.1.0
  background_locator_2: ^2.1.7
  shared_preferences: ^2.2.2
  http: ^1.1.0
  provider: ^6.1.1
  sqflite: ^2.3.0
  path: ^1.8.3
  workmanager: ^0.5.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
*/

// main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workmanager/workmanager.dart';
import 'services/location_service.dart';
import 'services/database_service.dart';
import 'screens/home_screen.dart';
import 'models/location_model.dart';

// Background task callback
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      print("🔥 Background task executando: $task");
      
      final locationService = LocationService();
      await locationService.getCurrentLocationAndSave();
      
      return Future.value(true);
    } catch (e) {
      print("❌ Erro no background task: $e");
      return Future.value(false);
    }
  });
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializa o WorkManager para tasks em background
  await Workmanager().initialize(
    callbackDispatcher,
    isInDebugMode: true,
  );
  
  // Inicializa o banco de dados
  await DatabaseService().initDatabase();
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => LocationService(),
      child: MaterialApp(
        title: 'Location Tracker',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
        home: HomeScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

// models/location_model.dart
class LocationModel {
  final int? id;
  final double latitude;
  final double longitude;
  final double accuracy;
  final double? speed;
  final double? heading;
  final DateTime timestamp;
  final bool sentToServer;

  LocationModel({
    this.id,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    this.speed,
    this.heading,
    required this.timestamp,
    this.sentToServer = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'speed': speed,
      'heading': heading,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'sentToServer': sentToServer ? 1 : 0,
    };
  }

  factory LocationModel.fromMap(Map<String, dynamic> map) {
    return LocationModel(
      id: map['id'],
      latitude: map['latitude'],
      longitude: map['longitude'],
      accuracy: map['accuracy'],
      speed: map['speed'],
      heading: map['heading'],
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp']),
      sentToServer: map['sentToServer'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'speed': speed,
      'heading': heading,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

// services/database_service.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/location_model.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDatabase();
    return _database!;
  }

  Future<Database> initDatabase() async {
    String path = join(await getDatabasesPath(), 'locations.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE locations(id INTEGER PRIMARY KEY AUTOINCREMENT, '
          'latitude REAL, longitude REAL, accuracy REAL, speed REAL, '
          'heading REAL, timestamp INTEGER, sentToServer INTEGER)',
        );
      },
    );
  }

  Future<int> insertLocation(LocationModel location) async {
    final db = await database;
    return await db.insert('locations', location.toMap());
  }

  Future<List<LocationModel>> getLocations({int limit = 100}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'locations',
      orderBy: 'timestamp DESC',
      limit: limit,
    );

    return List.generate(maps.length, (i) {
      return LocationModel.fromMap(maps[i]);
    });
  }

  Future<List<LocationModel>> getUnsentLocations() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'locations',
      where: 'sentToServer = ?',
      whereArgs: [0],
    );

    return List.generate(maps.length, (i) {
      return LocationModel.fromMap(maps[i]);
    });
  }

  Future<int> markLocationAsSent(int id) async {
    final db = await database;
    return await db.update(
      'locations',
      {'sentToServer': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<int> getLocationCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) FROM locations');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<void> deleteOldLocations({int keepLast = 1000}) async {
    final db = await database;
    await db.execute(
      'DELETE FROM locations WHERE id NOT IN '
      '(SELECT id FROM locations ORDER BY timestamp DESC LIMIT ?)',
      [keepLast],
    );
  }
}

// services/location_service.dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:workmanager/workmanager.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import '../models/location_model.dart';
import 'database_service.dart';

class LocationService extends ChangeNotifier {
  Position? _currentPosition;
  bool _isTracking = false;
  String _statusMessage = 'Aguardando...';
  StreamSubscription<Position>? _positionStream;
  final DatabaseService _databaseService = DatabaseService();

  // Getters
  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;
  String get statusMessage => _statusMessage;

  // Configurações
  static const String BACKGROUND_TASK_ID = 'location_background_task';
  static const Duration BACKGROUND_INTERVAL = Duration(minutes: 15);
  
  // URL do seu servidor (substitua pela sua)
  static const String SERVER_URL = 'https://sua-api.com/api/location';

  Future<bool> checkAndRequestPermissions() async {
    try {
      _updateStatus('Verificando permissões...');

      // Verifica permissão de localização
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _updateStatus('Permissão de localização negada');
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _updateStatus('Permissão de localização negada permanentemente');
        await Geolocator.openAppSettings();
        return false;
      }

      // Para iOS, precisamos da permissão sempre
      if (permission != LocationPermission.always) {
        _updateStatus('Permissão "Sempre" necessária para background');
        permission = await Geolocator.requestPermission();
      }

      // Verifica se o serviço de localização está habilitado
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _updateStatus('Serviço de localização desabilitado');
        return false;
      }

      _updateStatus('Permissões OK');
      return true;
    } catch (e) {
      _updateStatus('Erro ao verificar permissões: $e');
      return false;
    }
  }

  Future<void> startLocationTracking() async {
    if (_isTracking) return;

    bool hasPermission = await checkAndRequestPermissions();
    if (!hasPermission) return;

    try {
      _updateStatus('Iniciando rastreamento...');
      _isTracking = true;
      notifyListeners();

      // Configurações de localização
      LocationSettings locationSettings = LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Atualiza a cada 10 metros
      );

      // Inicia stream de localização em tempo real
      _positionStream = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen(
        (Position position) {
          _currentPosition = position;
          _saveLocation(position);
          notifyListeners();
        },
        onError: (error) {
          _updateStatus('Erro no stream: $error');
        },
      );

      // Registra task em background
      await _registerBackgroundTask();
      
      _updateStatus('Rastreamento ativo');
    } catch (e) {
      _updateStatus('Erro ao iniciar: $e');
      _isTracking = false;
      notifyListeners();
    }
  }

  Future<void> stopLocationTracking() async {
    if (!_isTracking) return;

    try {
      _updateStatus('Parando rastreamento...');
      
      // Para o stream
      await _positionStream?.cancel();
      _positionStream = null;

      // Cancela task em background
      await Workmanager().cancelByUniqueName(BACKGROUND_TASK_ID);

      _isTracking = false;
      _updateStatus('Rastreamento parado');
      notifyListeners();
    } catch (e) {
      _updateStatus('Erro ao parar: $e');
    }
  }

  Future<void> _registerBackgroundTask() async {
    try {
      await Workmanager().registerPeriodicTask(
        BACKGROUND_TASK_ID,
        BACKGROUND_TASK_ID,
        frequency: BACKGROUND_INTERVAL,
        constraints: Constraints(
          networkType: NetworkType.not_required,
          requiresBatteryNotLow: false,
          requiresCharging: false,
          requiresDeviceIdle: false,
          requiresStorageNotLow: false,
        ),
      );
      print('✅ Background task registrada');
    } catch (e) {
      print('❌ Erro ao registrar background task: $e');
    }
  }

  Future<void> getCurrentLocationAndSave() async {
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      await _saveLocation(position);
      print('📍 Localização salva em background: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      print('❌ Erro ao obter localização: $e');
    }
  }

  Future<void> _saveLocation(Position position) async {
    try {
      LocationModel location = LocationModel(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
        timestamp: DateTime.now(),
      );

      // Salva no banco local
      await _databaseService.insertLocation(location);
      
      // Tenta enviar para o servidor
      await _sendLocationToServer(location);
      
      print('📍 Localização salva: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      print('❌ Erro ao salvar localização: $e');
    }
  }

  Future<void> _sendLocationToServer(LocationModel location) async {
    try {
      final response = await http.post(
        Uri.parse(SERVER_URL),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(location.toJson()),
      ).timeout(Duration(seconds: 10));

      if (response.statusCode == 200) {
        print('✅ Localização enviada para servidor');
        if (location.id != null) {
          await _databaseService.markLocationAsSent(location.id!);
        }
      } else {
        print('⚠️ Falha ao enviar: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Erro ao enviar para servidor: $e');
      // A localização fica salva localmente para retry posterior
    }
  }

  Future<void> syncPendingLocations() async {
    try {
      List<LocationModel> unsentLocations = await _databaseService.getUnsentLocations();
      
      for (LocationModel location in unsentLocations) {
        await _sendLocationToServer(location);
        await Future.delayed(Duration(milliseconds: 500)); // Rate limiting
      }
      
      _updateStatus('Sincronização completa');
    } catch (e) {
      _updateStatus('Erro na sincronização: $e');
    }
  }

  Future<List<LocationModel>> getLocationHistory({int limit = 100}) async {
    return await _databaseService.getLocations(limit: limit);
  }

  Future<int> getLocationCount() async {
    return await _databaseService.getLocationCount();
  }

  void _updateStatus(String message) {
    _statusMessage = message;
    notifyListeners();
    print('📱 Status: $message');
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }
}

// screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/location_service.dart';
import '../models/location_model.dart';
import 'location_history_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Verifica permissões ao iniciar
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<LocationService>().checkAndRequestPermissions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Location Tracker'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => LocationHistoryScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.sync),
            onPressed: () {
              context.read<LocationService>().syncPendingLocations();
            },
          ),
        ],
      ),
      body: Consumer<LocationService>(
        builder: (context, locationService, child) {
          return Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Status Card
                Card(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              locationService.isTracking 
                                ? Icons.location_on 
                                : Icons.location_off,
                              color: locationService.isTracking 
                                ? Colors.green 
                                : Colors.red,
                              size: 24,
                            ),
                            SizedBox(width: 8),
                            Text(
                              locationService.isTracking 
                                ? 'Rastreamento Ativo' 
                                : 'Rastreamento Inativo',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          locationService.statusMessage,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                SizedBox(height: 16),
                
                // Current Location Card
                if (locationService.currentPosition != null)
                  Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Localização Atual',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 12),
                          _buildLocationInfo(
                            'Latitude',
                            locationService.currentPosition!.latitude.toStringAsFixed(6),
                          ),
                          _buildLocationInfo(
                            'Longitude',
                            locationService.currentPosition!.longitude.toStringAsFixed(6),
                          ),
                          _buildLocationInfo(
                            'Precisão',
                            '${locationService.currentPosition!.accuracy.toStringAsFixed(1)}m',
                          ),
                          if (locationService.currentPosition!.speed > 0)
                            _buildLocationInfo(
                              'Velocidade',
                              '${(locationService.currentPosition!.speed * 3.6).toStringAsFixed(1)} km/h',
                            ),
                          _buildLocationInfo(
                            'Atualizado',
                            _formatTime(DateTime.now()),
                          ),
                        ],
                      ),
                    ),
                  ),
                
                SizedBox(height: 16),
                
                // Stats Card
                FutureBuilder<int>(
                  future: locationService.getLocationCount(),
                  builder: (context, snapshot) {
                    return Card(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem(
                              'Localizações Salvas',
                              snapshot.data?.toString() ?? '0',
                              Icons.save,
                            ),
                            _buildStatItem(
                              'Status',
                              locationService.isTracking ? 'Online' : 'Offline',
                              locationService.isTracking ? Icons.cloud_done : Icons.cloud_off,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                
                Spacer(),
                
                // Control Buttons
                Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: locationService.isTracking
                            ? () => locationService.stopLocationTracking()
                            : () => locationService.startLocationTracking(),
                        icon: Icon(
                          locationService.isTracking ? Icons.stop : Icons.play_arrow,
                        ),
                        label: Text(
                          locationService.isTracking 
                            ? 'Parar Rastreamento' 
                            : 'Iniciar Rastreamento',
                          style: TextStyle(fontSize: 16),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: locationService.isTracking 
                            ? Colors.red 
                            : Colors.green,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                    
                    SizedBox(height: 12),
                    
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LocationHistoryScreen(),
                            ),
                          );
                        },
                        icon: Icon(Icons.history),
                        label: Text('Ver Histórico'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLocationInfo(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.blue),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  String _formatTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:'
           '${dateTime.minute.toString().padLeft(2, '0')}:'
           '${dateTime.second.toString().padLeft(2, '0')}';
  }
}

// screens/location_history_screen.dart
import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../models/location_model.dart';

class LocationHistoryScreen extends StatefulWidget {
  @override
  _LocationHistoryScreenState createState() => _LocationHistoryScreenState();
}

class _LocationHistoryScreenState extends State<LocationHistoryScreen> {
  final LocationService _locationService = LocationService();
  List<LocationModel> _locations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLocations();
  }

  Future<void> _loadLocations() async {
    setState(() {
      _isLoading = true;
    });

    try {
      List<LocationModel> locations = await _locationService.getLocationHistory(limit: 500);
      setState(() {
        _locations = locations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar histórico: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Histórico de Localizações'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadLocations,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _locations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.location_off,
                        size: 64,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Nenhuma localização salva',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Padding(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        'Total: ${_locations.length} localizações',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _locations.length,
                        itemBuilder: (context, index) {
                          LocationModel location = _locations[index];
                          return Card(
                            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: location.sentToServer ? Colors.green : Colors.orange,
                                child: Icon(
                                  location.sentToServer ? Icons.cloud_done : Icons.cloud_queue,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                '${location.latitude.toStringAsFixed(6)}, ${location.longitude.toStringAsFixed(6)}',
                                style: TextStyle(fontFamily: 'monospace'),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(height: 4),
                                  Text('Precisão: ${location.accuracy.toStringAsFixed(1)}m'),
                                  if (location.speed != null && location.speed! > 0)
                                    Text('Velocidade: ${(location.speed! * 3.6).toStringAsFixed(1)} km/h'),
                                  Text(_formatDateTime(location.timestamp)),
                                ],
                              ),
                              trailing: Icon(Icons.location_on, color: Colors.blue),
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/'
           '${dateTime.month.toString().padLeft(2, '0')}/'
           '${dateTime.year} '
           '${dateTime.hour.toString().padLeft(2, '0')}:'
           '${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
