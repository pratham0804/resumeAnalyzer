import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

Updated on 2025-05-16 10:30:55 - Change #9726

Updated on 2025-05-16 10:31:01 - Change #9234

Updated on 2025-05-16 10:31:07 - Change #5035

Updated on 2025-05-16 10:31:17 - Change #2613

Updated on 2025-05-16 10:31:30 - Change #5086
