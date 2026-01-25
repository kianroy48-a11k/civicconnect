import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, MapPin, Calendar, List } from 'lucide-react';

export default function IssueFilterBar({ filters, onFilterChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
        <SelectTrigger className="h-8 text-xs border-emerald-200 min-w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Garbage">🗑️ Garbage</SelectItem>
          <SelectItem value="Water">💧 Water</SelectItem>
          <SelectItem value="Road">🛣️ Road</SelectItem>
          <SelectItem value="Safety">⚠️ Safety</SelectItem>
          <SelectItem value="Parks">🌳 Parks</SelectItem>
          <SelectItem value="Other">📋 Other</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
        <SelectTrigger className="h-8 text-xs border-emerald-200 min-w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Reported">Reported</SelectItem>
          <SelectItem value="Verified">Verified</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.sort} onValueChange={(value) => onFilterChange({ ...filters, sort: value })}>
        <SelectTrigger className="h-8 text-xs border-emerald-200 min-w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="proximity">High Priority</SelectItem>
          <SelectItem value="ignored">Ignored</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}