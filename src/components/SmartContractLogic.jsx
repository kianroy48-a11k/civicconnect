import { isPast } from 'date-fns';

export function getContractStatus(issue) {
  if (!issue.contract_activated) {
    return issue.contract_status || 'Reported';
  }

  if (issue.contract_status === 'Resolved') {
    return 'Resolved';
  }

  if (issue.resolution_deadline && isPast(new Date(issue.resolution_deadline))) {
    return 'Contract Breached';
  }

  return issue.contract_status || 'Accepted';
}

export function isContractBreached(issue) {
  return getContractStatus(issue) === 'Contract Breached';
}

export function canResolveContract(issue) {
  if (!issue.contract_activated) return false;
  if (issue.contract_status === 'Resolved') return false;
  if (issue.resolution_deadline && isPast(new Date(issue.resolution_deadline))) return false;
  return true;
}

export function getContractColor(status) {
  switch(status) {
    case 'Reported': return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Accepted': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Resolved': return 'bg-green-100 text-green-700 border-green-300';
    case 'Contract Breached': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}