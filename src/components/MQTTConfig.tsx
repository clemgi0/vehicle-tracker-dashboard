import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface MQTTConfigData {
  brokerUrl: string;
  topic: string;
  username?: string;
  password?: string;
  caCert: string;
  clientCert: string;
  clientKey: string;
}

interface MQTTConfigProps {
  onConnect: (config: MQTTConfigData) => void;
}

const MQTTConfig = ({ onConnect }: MQTTConfigProps) => {
  const [config, setConfig] = useState<MQTTConfigData>({
    brokerUrl: 'mqtts://broker.example.com:8883',
    topic: 'test/mutuo',
    username: '',
    password: '',
    caCert: '',
    clientCert: '',
    clientKey: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  return (
    <Card className="p-6 border-border bg-card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">MQTT Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="brokerUrl">Broker URL (with mqtts://)</Label>
          <Input
            id="brokerUrl"
            type="text"
            value={config.brokerUrl}
            onChange={(e) => setConfig({ ...config, brokerUrl: e.target.value })}
            placeholder="mqtts://broker.example.com:8883"
            required
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            type="text"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            placeholder="test/mutuo"
            required
            className="bg-secondary border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username (optional)</Label>
            <Input
              id="username"
              type="text"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="caCert">CA Certificate</Label>
          <Textarea
            id="caCert"
            value={config.caCert}
            onChange={(e) => setConfig({ ...config, caCert: e.target.value })}
            placeholder="-----BEGIN CERTIFICATE-----"
            className="bg-secondary border-border font-mono text-xs"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="clientCert">Client Certificate</Label>
          <Textarea
            id="clientCert"
            value={config.clientCert}
            onChange={(e) => setConfig({ ...config, clientCert: e.target.value })}
            placeholder="-----BEGIN CERTIFICATE-----"
            className="bg-secondary border-border font-mono text-xs"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="clientKey">Client Key</Label>
          <Textarea
            id="clientKey"
            value={config.clientKey}
            onChange={(e) => setConfig({ ...config, clientKey: e.target.value })}
            placeholder="-----BEGIN PRIVATE KEY-----"
            className="bg-secondary border-border font-mono text-xs"
            rows={4}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Connect to MQTT
        </Button>
      </form>
    </Card>
  );
};

export default MQTTConfig;
