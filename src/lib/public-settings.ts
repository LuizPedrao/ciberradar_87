import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const publicSettingsQuery = queryOptions({
  queryKey: ["public-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_public_settings");
    if (error) throw error;
    return (data?.[0] ?? { whatsapp_number: null, contact_email: null }) as {
      whatsapp_number: string | null;
      contact_email: string | null;
    };
  },
  staleTime: 60_000,
});
