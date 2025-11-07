export interface DoorCode {
  id: string; // db uuid
  code_number: number;
  description: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  template: string;
  links: string[];
}

export interface Property {
  id: string;
  name: string;
  whatsAppGroups: WhatsAppGroup[];
  doorCodes: DoorCode[];
}

export type View =
  | { page: 'propertyList' }
  | { page: 'propertyDetail'; propertyId: string }
  | { page: 'whatsAppGroupDetail'; propertyId: string; groupId: string }
  | { page: 'doorCodeList'; propertyId: string };
