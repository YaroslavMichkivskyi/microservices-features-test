export interface UserContext {
  userId: string;
  email?: string;
  organizationId: string;
  role: 'ADMIN' | 'USER';
}
