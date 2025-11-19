import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  credits: string;
}

interface ClientSelectorProps {
  onClientChange: (clientId: string | null) => void;
  selectedClientId: string | null;
}

export function ClientSelector({ onClientChange, selectedClientId }: ClientSelectorProps) {
  const { data: clientsData, isLoading } = useQuery<{ 
    success: boolean; 
    clients: Client[];
  }>({
    queryKey: ['/api/admin/clients']
  });

  const clients = clientsData?.clients || [];

  // Auto-select first client if none selected
  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      onClientChange(clients[0].id);
    }
  }, [clients, selectedClientId, onClientChange]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Acting as Client</Label>
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Acting as Client</Label>
        <p className="text-sm text-muted-foreground">No clients available</p>
      </div>
    );
  }

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-2">
      <Label htmlFor="client-selector">Acting as Client</Label>
      <Select 
        value={selectedClientId || undefined} 
        onValueChange={onClientChange}
      >
        <SelectTrigger id="client-selector" data-testid="select-client">
          <SelectValue placeholder="Select a client">
            {selectedClient && (
              <span className="flex items-center justify-between w-full">
                <span>{selectedClient.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ${parseFloat(selectedClient.credits).toFixed(2)} credits
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem 
              key={client.id} 
              value={client.id}
              data-testid={`option-client-${client.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">{client.email}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-4">
                  ${parseFloat(client.credits).toFixed(2)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedClient && (
        <p className="text-xs text-muted-foreground">
          All actions will be performed as <span className="font-medium">{selectedClient.name}</span>
        </p>
      )}
    </div>
  );
}
