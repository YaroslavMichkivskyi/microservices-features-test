import { Role } from '../enums';

export interface UserContext {
  userId: string;
  email: string;
  organizationId: string;
  role: Role;
}
