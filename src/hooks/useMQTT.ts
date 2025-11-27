import { useEffect, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { useToast } from '@/hooks/use-toast';

interface MQTTConfig {
  brokerUrl: string;
  topic: string;
  username?: string;
  password?: string;
  caCert: string;
  clientCert: string;
  clientKey: string;
}

interface VehicleData {
  essence: number;
  latitude: number;
  longitude: number;
  speed: number;
  moduleId: number;
}

export const useMQTT = (config: MQTTConfig | null, onDataReceived: (data: VehicleData) => void) => {
  const clientRef = useRef<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!config) return;

    const options: mqtt.IClientOptions = {
      protocol: 'mqtts',
      username: config.username,
      password: config.password,
      rejectUnauthorized: true,
      ca: config.caCert,
      cert: config.clientCert,
      key: config.clientKey,
    };

    try {
      const client = mqtt.connect(config.brokerUrl, options);
      clientRef.current = client;

      client.on('connect', () => {
        console.log('MQTT connected');
        setIsConnected(true);
        client.subscribe(config.topic, (err) => {
          if (err) {
            console.error('Subscribe error:', err);
            toast({
              title: 'Subscription Error',
              description: 'Failed to subscribe to MQTT topic',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'MQTT Connected',
              description: `Subscribed to ${config.topic}`,
            });
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          // Map the data to match expected format
          const vehicleData: VehicleData = {
            essence: data.gas || data.essence || 0,
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            speed: data.speed || 0,
            moduleId: data.id || data.moduleId || 0,
          };
          onDataReceived(vehicleData);
        } catch (error) {
          console.error('Error parsing MQTT message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('MQTT error:', error);
        toast({
          title: 'MQTT Error',
          description: error.message,
          variant: 'destructive',
        });
      });

      client.on('close', () => {
        console.log('MQTT disconnected');
        setIsConnected(false);
      });

    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to MQTT broker',
        variant: 'destructive',
      });
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [config, onDataReceived, toast]);

  const publish = (topic: string, message: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish(topic, message);
    }
  };

  return { isConnected, publish };
};
