import { Request } from 'express';

/**
 * Extended request object.
 */
export interface RequestExtended extends Request {
  id?: string;
}
