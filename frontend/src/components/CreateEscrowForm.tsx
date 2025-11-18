'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateEscrowFormProps {
  onSubmit: (data: any) => void;
}

export function CreateEscrowForm({ onSubmit }: CreateEscrowFormProps) {
  const [formData, setFormData] = useState({
    counterpartyId: '',
    amount: '',
    currency: 'NGN',
    description: '',
    expiresInDays: 7,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      expiresInDays: parseInt(formData.expiresInDays.toString()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="counterpartyId">Counterparty ID</Label>
        <Input
          id="counterpartyId"
          type="text"
          value={formData.counterpartyId}
          onChange={(e) => setFormData({ ...formData, counterpartyId: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">NGN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="expiresInDays">Expires In (Days)</Label>
        <Input
          id="expiresInDays"
          type="number"
          min="1"
          max="30"
          value={formData.expiresInDays}
          onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
        />
      </div>

      <Button type="submit" className="w-full">Create Escrow</Button>
    </form>
  );
}

