import type { IHostel } from "@/models";

export interface HostelDTO {
  id: string;
  name: string;
  code: string;
}

export function toHostelDTO(hostel: IHostel): HostelDTO {
  return { id: String(hostel._id), name: hostel.name, code: hostel.code };
}
