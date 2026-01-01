import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import Analytics from './analytics';

export default function App() {
  const [analytics] = useState(() => new Analytics('http://localhost:3001', '1.0.0'));
  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    // Track app launch
    analytics.trackScreenView('Home', 'Analytics Demo Home');
    
    // Load event history
    loadEventHistory();
  }, []);

  const loadEventHistory = async () => {
    const history = await analytics.getEventHistory();
    setEventLog(history);
  };

  const handleButtonPress = async (action) => {
    await analytics.trackButtonTap(`btn-${action}`, 'Home', {
      button_label: action,
      timestamp: new Date().toISOString()
    });
    
    // Refresh event log
    loadEventHistory();
  };

  const handleSwipe = async (direction) => {
    await analytics.trackSwipeGesture(direction, 'Home');
    loadEventHistory();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics Platform</Text>
        <Text style={styles.subtitle}>Mobile Demo App</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎯 How It Works</Text>
          <Text style={styles.infoText}>
            When you tap any button, an analytics event is sent to Kafka, 
            processed by Bento, stored in PostgreSQL, and visualized in Grafana.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Text style={styles.sectionTitle}>Test Analytics Events</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => handleButtonPress('primary-action')}
          >
            <Text style={styles.buttonText}>Primary Action</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => handleButtonPress('secondary-action')}
          >
            <Text style={styles.buttonText}>Secondary Action</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.successButton]}
            onPress={() => handleButtonPress('success-action')}
          >
            <Text style={styles.buttonText}>Success Action</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.gestureButton]}
            onPress={() => handleSwipe('left')}
          >
            <Text style={styles.buttonText}>← Simulate Swipe Left</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventLogSection}>
          <Text style={styles.sectionTitle}>Event Log (Last 5)</Text>
          {eventLog.length === 0 ? (
            <Text style={styles.noEvents}>No events yet. Tap a button to start!</Text>
          ) : (
            eventLog.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventType}>{event.event_type}</Text>
                <Text style={styles.eventDetails}>
                  Target: {event.interaction_target || 'N/A'}
                </Text>
                <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoTitle}>Device Info</Text>
          <Text style={styles.deviceInfoText}>Platform: {Platform.OS}</Text>
          <Text style={styles.deviceInfoText}>Device: {Device.modelName || 'Unknown'}</Text>
          <Text style={styles.deviceInfoText}>Session: {analytics.sessionId.substring(0, 20)}...</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: Constants.statusBarHeight + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  buttonSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#9b59b6',
  },
  successButton: {
    backgroundColor: '#2ecc71',
  },
  gestureButton: {
    backgroundColor: '#e67e22',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventLogSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  noEvents: {
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  eventItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingVertical: 10,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  deviceInfo: {
    backgroundColor: '#34495e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  deviceInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
  },
  deviceInfoText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 5,
  },
});
