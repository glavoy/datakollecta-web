
import { supabase } from "@/lib/supabase";

export interface FieldWorker {
  id: string;
  username: string;
  project_id: string;
  description?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

export const teamService = {
  /**
   * Fetch all field workers (app credentials) for a specific project.
   */
  async getFieldWorkers(projectId: string): Promise<FieldWorker[]> {
    const { data, error } = await supabase
      .from("app_credentials")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch all field workers across all projects (with project name).
   */
  async getAllFieldWorkers() {
    const { data, error } = await supabase
      .from("app_credentials")
      .select("*, projects(name)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new field worker credential using the server-side RPC.
   */
  async createCredential(projectId: string, username: string, password: string, description: string) {
    const { data, error } = await supabase.rpc("create_app_credential", {
      p_project_id: projectId,
      p_username: username,
      p_password: password,
      p_description: description,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Revoke (delete or deactivate) a credential.
   * For now, we'll hard delete, or we can soft delete if you prefer.
   * Let's start with hard delete to keep it simple, or update is_active.
   */
  async deleteCredential(credentialId: string) {
    const { error } = await supabase
      .from("app_credentials")
      .delete()
      .eq("id", credentialId);

    if (error) throw error;
  },
  
  /**
   * Toggle active status
   */
    async toggleStatus(credentialId: string, isActive: boolean) {
        const { error } = await supabase
        .from("app_credentials")
        .update({ is_active: isActive })
        .eq("id", credentialId);
    
        if (error) throw error;
    }
};
