export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Event types
export interface Event {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
}

// Swap types
export interface SwapRequest {
  _id: string;
  name:string;
  requesterSlotId: Event;
  targetSlotId: Event;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface SwapRequestsResponse {
  incoming: SwapRequest[];
  outgoing: SwapRequest[];
}

export interface CreateSwapRequestData {
  mySlotId: string;
  theirSlotId: string;
}

export interface SwapResponseData {
  accepted: boolean;
}